import { createClient } from '@supabase/supabase-js';
import { SupabaseErrorTranslator } from './translateSupabaseError';
import { i18nService } from '@/i18n/services/i18n.service';

// 从环境变量获取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing');
  console.error('🔧 Required environment variables:');
  console.error('  - VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('  - VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

  if (import.meta.env.PROD) {
    throw new Error('Supabase configuration is required in production. Please check environment variables.');
  } else {
    console.warn('⚠️ Online features will be unavailable in development');
  }
}

// 始终使用原始 Supabase URL，避免代理导致的复杂性
const getSupabaseUrl = () => {
  return supabaseUrl || '';
};

// 创建原始 Supabase 客户端
const rawSupabase = createClient(getSupabaseUrl(), supabaseAnonKey || '', {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  // 使用 global.headers 设置
  global: {
    headers: {
      'apikey': supabaseAnonKey || '',
      'Authorization': `Bearer ${supabaseAnonKey || ''}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
});

// 创建带错误处理的代理对象
const supabaseProxy = new Proxy(rawSupabase, {
  get(target, prop) {
    const value = target[prop];

    // 如果是函数，返回包装后的函数
    if (typeof value === 'function') {
      return function(...args: any[]) {
        // 添加调用日志
        const isAuthCall = prop === 'auth' || (prop === 'from' && args.length > 0);
        if (isAuthCall) {
          console.log(`🔗 [Supabase Proxy] 调用方法: ${prop}`, args.length > 0 ? args[0] : '');
        }

        try {
          const startTime = Date.now();
          const result = value.apply(target, args);

          // 如果是同步返回结果
          if (!result || typeof result.then !== 'function') {
            if (isAuthCall) {
              console.log(`✅ [Supabase Proxy] ${prop} 同步调用完成 (${Date.now() - startTime}ms)`);
            }
            return result;
          }

          // 如果是 Promise，添加日志
          return result.then((data: any) => {
            if (isAuthCall) {
              console.log(`✅ [Supabase Proxy] ${prop} Promise 成功 (${Date.now() - startTime}ms)`);
            }
            return data;
          }).catch((error: any) => {
            if (isAuthCall) {
              console.error(`❌ [Supabase Proxy] ${prop} Promise 失败 (${Date.now() - startTime}ms):`, error);
            }
            if (SupabaseErrorTranslator.isSupabaseError(error)) {
              const currentLang = i18nService.getCurrentLanguage();
              const translatedMessage = SupabaseErrorTranslator.translate(error, currentLang);
              const translatedError = new Error(translatedMessage);
              // 保留原始错误信息
              Object.assign(translatedError, {
                originalError: error,
                code: error.code,
                status: error.status
              });
              throw translatedError;
            }
            throw error;
          });
        } catch (error) {
          // 同步错误处理
          if (isAuthCall) {
            console.error(`❌ [Supabase Proxy] ${prop} 同步调用失败:`, error);
          }
          if (SupabaseErrorTranslator.isSupabaseError(error)) {
            const currentLang = i18nService.getCurrentLanguage();
            const translatedError = new Error(SupabaseErrorTranslator.translate(error, currentLang));
            Object.assign(translatedError, {
              originalError: error,
              code: error.code,
              status: error.status
            });
            throw translatedError;
          }
          throw error;
        }
      };
    }

    // 处理嵌套对象（如 auth, from 等）
    if (typeof value === 'object' && value !== null) {
      return new Proxy(value, {
        get(obj, key) {
          const val = obj[key];

          if (typeof val === 'function') {
            return function(...args: any[]) {
              const result = val.apply(obj, args);

              if (result && typeof result.then === 'function') {
                return result.then((data: any) => {
                  // 处理 Supabase 的 { data, error } 返回格式
                  if (data && typeof data === 'object' && 'error' in data && data.error) {
                    if (SupabaseErrorTranslator.isSupabaseError(data.error)) {
                      const currentLang = i18nService.getCurrentLanguage();
                      const translatedMessage = SupabaseErrorTranslator.translate(data.error, currentLang);
                      return {
                        ...data,
                        error: {
                          ...data.error,
                          message: translatedMessage
                        }
                      };
                    }
                  }
                  return data;
                }).catch((error: any) => {
                  if (SupabaseErrorTranslator.isSupabaseError(error)) {
                    const translatedError = new Error(SupabaseErrorTranslator.translate(error));
                    Object.assign(translatedError, {
                      originalError: error,
                      code: error.code,
                      status: error.status
                    });
                    throw translatedError;
                  }
                  throw error;
                });
              }

              // 处理同步返回的结果
              if (result && typeof result === 'object' && 'error' in result && result.error) {
                if (SupabaseErrorTranslator.isSupabaseError(result.error)) {
                  const currentLang = i18nService.getCurrentLanguage();
                  const translatedMessage = SupabaseErrorTranslator.translate(result.error, currentLang);
                  return {
                    ...result,
                    error: {
                      ...result.error,
                      message: translatedMessage
                    }
                  };
                }
              }

              return result;
            };
          }

          return val;
        }
      });
    }

    return value;
  }
});

// 导出带错误处理的 Supabase 客户端
export const supabase = supabaseProxy;

// 导出类型定义
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          display_name?: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          display_name?: string;
          avatar_url?: string;
        };
        Update: {
          email?: string;
          username?: string;
          display_name?: string;
          avatar_url?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          name: string;
          description?: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          owner_id: string;
        };
        Update: {
          name?: string;
          description?: string;
        };
      };
      bp_states: {
        Row: {
          room_id: string;
          hero_id: string;
          is_selected: boolean;
          updated_at: string;
        };
        Insert: {
          room_id: string;
          hero_id: string;
          is_selected: boolean;
        };
        Update: {
          is_selected: boolean;
        };
      };
    };
  };
}

// 检查 Supabase 连接是否可用
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// 实用工具函数 - 集成错误翻译
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase error:', error);

  // 使用错误翻译适配器
  if (SupabaseErrorTranslator.isSupabaseError(error)) {
    return SupabaseErrorTranslator.translate(error);
  }

  // 对于非Supabase错误，返回原始消息或默认消息
  return error?.message || 'An unknown error occurred';
};