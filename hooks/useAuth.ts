import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  display_name?: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isOnlineMode: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isOnlineMode: false
  });
  
  // 使用 ref 来跟踪初始化状态，避免依赖 authState
  const initializedRef = useRef(false);

  useEffect(() => {
    // 检查 Supabase 是否配置
    if (!isSupabaseConfigured()) {
      setAuthState({
        user: null,
        session: null,
        loading: false,
        isOnlineMode: false
      });
      return;
    }

    // 避免重复初始化
    if (initializedRef.current) {
      return;
    }
    
    initializedRef.current = true;

    // 获取初始会话
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // 不设置loading为false，等待onAuthStateChange
          return;
        }
        
        if (session?.user) {
          // 先设置基本用户信息，避免长时间加载
          const basicUserInfo = {
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.email?.split('@')[0] || '',
            display_name: undefined
          };
          
          setAuthState({
            user: basicUserInfo,
            session,
            loading: false,
            isOnlineMode: true
          });
          
          // 异步获取详细profile信息
          try {
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Profile fetch timeout')), 2000);
            });
            
            const profilePromise = supabase
              .from('profiles')
              .select('username, display_name')
              .eq('id', session.user.id)
              .maybeSingle();
            
            let profile, profileError;
            try {
              const result = await Promise.race([profilePromise, timeoutPromise]) as any;
              profile = result.data;
              profileError = result.error;
            } catch (raceError) {
              profileError = raceError;
            }
            
            // maybeSingle() 不会在没有找到记录时报错，只会返回 null
            // 只有在真正的查询错误时才抛出异常
            if (profileError && profileError.code !== 'PGRST116') {
              throw profileError;
            }

            // 更新用户信息为详细的profile数据（profile 可能为 null）
            setAuthState(prev => ({
              ...prev,
              user: {
                ...basicUserInfo,
                username: profile?.username || basicUserInfo.username,
                display_name: profile?.display_name
              }
            }));
          } catch (error) {
            // 保持基本用户信息，不抛出错误
          }
        } else {
          setAuthState({
            user: null,
            session,
            loading: false,
            isOnlineMode: false
          });
        }
      } catch (error) {
        // 即使getSession出错，也不要设置loading为false，等待onAuthStateChange
      }
    };

    console.log('About to call getInitialSession...');
    getInitialSession();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // 只处理非INITIAL_SESSION事件，避免重复处理
        if (event === 'INITIAL_SESSION') {
          return;
        }
        
        // 获取用户详细信息，包括username
        if (session?.user) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('username, display_name')
              .eq('id', session.user.id)
              .maybeSingle();

            // maybeSingle() 在没有找到记录时不会报错
            if (profileError && profileError.code !== 'PGRST116') {
              throw profileError;
            }
            
            setAuthState({
              user: {
                id: session.user.id,
                email: session.user.email || '',
                username: profile?.username || session.user.email?.split('@')[0] || '',
                display_name: profile?.display_name
              },
              session,
              loading: false,
              isOnlineMode: true
            });
          } catch (error) {
            // 即使获取profile失败，也要设置loading为false
            setAuthState({
              user: {
                id: session.user.id,
                email: session.user.email || '',
                username: session.user.email?.split('@')[0] || '',
                display_name: undefined
              },
              session,
              loading: false,
              isOnlineMode: true
            });
          }
        } else {
          setAuthState({
            user: null,
            session,
            loading: false,
            isOnlineMode: false
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // 空依赖数组，只执行一次

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Online features not available - Supabase not configured');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string, username?: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Online features not available - Supabase not configured');
    }

    // 获取当前网站的 URL，用于邮件验证重定向
    const redirectTo = `${window.location.origin}`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo
      }
    });

    if (error) throw error;

    // 如果提供了用户名，更新profile
    if (username && data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', data.user.id);

      if (profileError) throw profileError;
    }

    return data;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateUsername = async (newUsername: string) => {
    if (!isSupabaseConfigured() || !authState.user) {
      throw new Error('User not authenticated or Supabase not configured');
    }

    try {
      // 检查用户名是否已存在（使用更安全的方式）
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id, username')
        .neq('id', authState.user!.id);

      if (checkError) {
        console.error('Error checking existing username:', checkError);
        // 如果检查失败，继续尝试更新（可能是网络问题）
      } else {
        // 在客户端检查用户名是否已存在
        const usernameExists = existingUser?.some(profile => profile.username === newUsername);
        if (usernameExists) {
          throw new Error('用户名已存在');
        }
      }

      // 更新用户名
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', authState.user!.id);

      if (updateError) {
        console.error('Error updating username:', updateError);
        throw new Error('更新用户名失败：' + updateError.message);
      }

      // 更新本地状态
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, username: newUsername } : null
      }));
    } catch (error: any) {
      console.error('Update username error:', error);
      throw error;
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateUsername,
    isConfigured: isSupabaseConfigured()
  };
};