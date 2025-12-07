import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { checkEmailStatus, resendConfirmationEmail } from '../services/userCheckService';
import { Language } from '../i18n/types';

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

// 带重试机制的获取会话函数
const getSessionWithRetry = async (
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<{ session: any | null; error: any | null }> => {
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 [Auth] 获取会话尝试 ${attempt}/${maxRetries}...`);

    try {
      // 使用 Promise.race 添加超时
      const timeoutPromise = new Promise<{ session: null; error: Error }>((_, reject) => {
        setTimeout(() => reject(new Error('Get session timeout')), 5000);
      });

      const sessionPromise = supabase.auth.getSession();

      const result = await Promise.race([sessionPromise, timeoutPromise]) as any;

      if (result.error) {
        console.warn(`⚠️ [Auth] 尝试 ${attempt} 失败:`, result.error);
        lastError = result.error;
      } else {
        console.log(`✅ [Auth] 尝试 ${attempt} 成功获取会话`);
        return result;
      }
    } catch (err: any) {
      console.warn(`⚠️ [Auth] 尝试 ${attempt} 异常:`, err.message);
      lastError = err;
    }

    // 如果不是最后一次尝试，等待后重试
    if (attempt < maxRetries) {
      console.log(`⏳ [Auth] 等待 ${retryDelay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      // 指数退避
      retryDelay *= 2;
    }
  }

  console.error(`❌ [Auth] 所有 ${maxRetries} 次尝试都失败了`);
  return { session: null, error: lastError };
};

// 处理会话的通用函数
const handleSession = async (
  session: any | null,
  source: 'initial' | 'timeout' | 'auth_change',
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
) => {
  console.log(`🔐 [Auth] 处理会话 - 来源: ${source}, 会话状态: ${session ? '有效' : '无'}`);

  if (session?.user) {
    // 先设置基本用户信息，避免长时间加载
    const basicUserInfo = {
      id: session.user.id,
      email: session.user.email || '',
      username: session.user.email?.split('@')[0] || '',
      display_name: undefined
    };

    console.log(`👤 [Auth] 设置基本用户信息:`, basicUserInfo);

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
        console.log(`📋 [Auth] 获取用户详细信息...`);
        const result = await Promise.race([profilePromise, timeoutPromise]) as any;
        profile = result.data;
        profileError = result.error;
      } catch (raceError) {
        console.warn(`⚠️ [Auth] 获取用户详细信息超时或失败:`, raceError);
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
          display_name: profile?.display_name || basicUserInfo.display_name,
        }
      }));

      console.log(`✅ [Auth] 用户信息更新完成`);
    } catch (error: any) {
      console.error('❌ [Auth] 获取用户详细信息失败:', error);
      // 即使profile获取失败，也不影响基本认证状态
    }
  } else {
    console.log(`🚫 [Auth] 无有效会话，设置未认证状态`);
    setAuthState({
      user: null,
      session,
      loading: false,
      isOnlineMode: false
    });
  }
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isOnlineMode: false
  });

  // 使用 ref 来跟踪初始化状态，避免依赖 authState
  const initializedRef = useRef(false);
  // 跟踪重试次数，防止无限循环
  const retryCountRef = useRef(0);
  // 跟踪是否正在重试，避免并发重试
  const isRetryingRef = useRef(false);
  // 最大重试次数
  const MAX_RETRY_COUNT = 3;

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

    getInitialSession();

    // 添加超时保护，防止永远加载
    const loadingTimeout = setTimeout(async () => {
      setAuthState(prev => {
        if (prev.loading && !isRetryingRef.current && retryCountRef.current < MAX_RETRY_COUNT) {
          console.log(`⚠️ [Auth Timeout] 认证加载超时，开始第 ${retryCountRef.current + 1}/${MAX_RETRY_COUNT} 次重试...`);

          // 设置重试状态
          isRetryingRef.current = true;
          retryCountRef.current++;

          // 超时后使用重试机制
          const retrySession = async () => {
            try {
              const { session, error } = await getSessionWithRetry();

              if (error) {
                console.error(`❌ [Auth Timeout] 第 ${retryCountRef.current} 次重试失败:`, error);

                if (retryCountRef.current >= MAX_RETRY_COUNT) {
                  console.error(`❌ [Auth Timeout] 已达到最大重试次数 ${MAX_RETRY_COUNT}，停止重试`);
                  setAuthState({
                    user: null,
                    session: null,
                    loading: false,
                    isOnlineMode: false
                  });
                } else {
                  // 继续重试
                  isRetryingRef.current = false;
                }
              } else {
                console.log(`✅ [Auth Timeout] 第 ${retryCountRef.current} 次重试成功`);
                await handleSession(session, 'timeout', setAuthState);
              }
            } catch (err) {
              console.error(`❌ [Auth Timeout] 第 ${retryCountRef.current} 次重试异常:`, err);
              setAuthState({
                user: null,
                session: null,
                loading: false,
                isOnlineMode: false
              });
            } finally {
              isRetryingRef.current = false;
            }
          };

          retrySession();
        } else if (prev.loading && retryCountRef.current >= MAX_RETRY_COUNT) {
          console.error(`❌ [Auth Timeout] 已达到最大重试次数，停止加载`);
          setAuthState({
            user: null,
            session: null,
            loading: false,
            isOnlineMode: false
          });
        }
        return prev;
      });
    }, 3000); // 3秒超时

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // 对于INITIAL_SESSION事件，只有当loading为true时才处理（页面刷新的情况）
        if (event === 'INITIAL_SESSION') {
          if (authState.loading) {
            console.log('🔄 [Auth] 处理INITIAL_SESSION事件 - 页面刷新场景');
            await handleSession(session, 'auth_change', setAuthState);
          }
          return;
        }

        // 处理SIGNED_IN事件，确保登录后立即更新状态
        if (event === 'SIGNED_IN') {
          console.log('🎉 [Auth] 处理SIGNED_IN事件，立即设置用户状态');
          await handleSession(session, 'auth_change', setAuthState);
          return;
        }

        // 处理SIGNED_OUT事件，确保退出登录后立即清空状态
        if (event === 'SIGNED_OUT') {
          console.log('👋 处理SIGNED_OUT事件，清空用户状态');
          setAuthState({
            user: null,
            session,
            loading: false,
            isOnlineMode: false
          });
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

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []); // 空依赖数组，只执行一次

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Online features not available - Supabase not configured');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // 错误已经被代理翻译，直接抛出
      throw new Error(error.message);
    }
    return data;
  };

  const signUp = async (email: string, password: string, username?: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Online features not available - Supabase not configured');
    }

    // 获取当前网站的 URL，用于邮件验证重定向
    const redirectTo = `${window.location.origin}`;

    // 获取当前语言设置
    const currentLanguage = (() => {
      try {
        return localStorage.getItem('i18n-language') as Language || 'zh-CN';
      } catch {
        return 'zh-CN';
      }
    })();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          language: currentLanguage
        },
        redirectTo: redirectTo
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    // 如果提供了用户名，更新profile
    if (username && data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', data.user.id);

      if (profileError) {
        throw new Error(profileError.message);
      }
    }

    return data;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // 立即更新本地状态，确保 UI 立即响应
    setAuthState({
      user: null,
      session: null,
      loading: false,
      isOnlineMode: false
    });
  };

  const updateUsername = async (newUsername: string) => {
    if (!isSupabaseConfigured() || !authState.user) {
      throw new Error('User not authenticated or Supabase not configured');
    }

    try {
      // 直接更新用户名，不检查唯一性，允许用户名重复
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

  // 检查邮箱注册状态
  const checkEmailRegistrationStatus = async (email: string) => {
    // 强制执行邮箱检查，跳过配置检查以测试功能
    console.log('🔧 强制执行邮箱检查，跳过配置检查');
    try {
      return await checkEmailStatus(email);
    } catch (error) {
      console.error('邮箱检查失败:', error);
      return { status: 'not_registered' as const };
    }
  };

  // 重新发送验证邮件
  const resendVerificationEmail = async (email: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Online features not available - Supabase not configured');
    }

    const result = await resendConfirmationEmail(email);
    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  };

  // 重发确认邮件服务（与UI组件配合使用）
  const resendConfirmationEmailService = resendVerificationEmail;

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateUsername,
    checkEmailRegistrationStatus,
    resendVerificationEmail,
    resendConfirmationEmailService,
    isConfigured: isSupabaseConfigured()
  };
};