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
const createSupabaseClient = () => createClient(getSupabaseUrl(), supabaseAnonKey || '', {
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

// 初始创建客户端
let rawSupabase = createSupabaseClient();
let clientCreationTime = Date.now();

// 检测网络请求是否发出的工具
const requestTracker = {
  pendingRequests: new Map(),

  trackRequest(method: string, url: string) {
    const id = `${method}-${url}-${Date.now()}`;
    this.pendingRequests.set(id, {
      method,
      url,
      startTime: Date.now(),
      resolved: false
    });
    console.log(`🌐 [Request Tracker] 开始跟踪请求: ${method} ${url}`);

    // 10秒后检查是否完成
    setTimeout(() => {
      const req = this.pendingRequests.get(id);
      if (req && !req.resolved) {
        console.warn(`⚠️ [Request Tracker] 请求超时未完成: ${method} ${url}`);
        this.markRequestStuck(id);
      }
    }, 10000);

    return id;
  },

  resolveRequest(id: string) {
    const req = this.pendingRequests.get(id);
    if (req) {
      req.resolved = true;
      console.log(`✅ [Request Tracker] 请求完成: ${req.method} ${req.url} (${Date.now() - req.startTime}ms)`);
    }
  },

  markRequestStuck(id: string) {
    const req = this.pendingRequests.get(id);
    if (req && !req.resolved) {
      console.error(`❌ [Request Tracker] 请求卡住: ${req.method} ${req.url}`);
      // 触发客户端重建
      triggerClientRecreation();
    }
  }
};

// 客户端重建计数器
let recreationCount = 0;
const MAX_RECREATIONS = 3;

// 拦截 fetch 来跟踪实际的 HTTP 请求
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options] = args;

  // 检查是否是对 Supabase 的请求
  if (url && typeof url === 'string' && url.includes(supabaseUrl?.replace('https://', '').replace('http://', '') || '')) {
    console.log(`🌐 [Fetch Interceptor] 拦截到 Supabase 请求: ${options?.method || 'GET'} ${url}`);

    // 返回包装后的 Promise
    const fetchPromise = originalFetch.apply(this, args);

    // 标记请求已发出
    requestTracker.resolveRequest(url);

    return fetchPromise
      .then(response => {
        console.log(`✅ [Fetch Interceptor] 请求成功: ${response.status} ${options?.method || 'GET'} ${url}`);
        return response;
      })
      .catch(error => {
        console.error(`❌ [Fetch Interceptor] 请求失败:`, error);
        // 如果是网络错误，考虑重建客户端
        if (error.name === 'TypeError' || error.message.includes('NetworkError')) {
          console.warn(`⚠️ [Fetch Interceptor] 检测到网络错误，可能需要重建客户端`);
        }
        throw error;
      });
  }

  // 非 Supabase 请求，直接调用原始 fetch
  return originalFetch.apply(this, args);
};

// 触发客户端重建
function triggerClientRecreation() {
  if (recreationCount >= MAX_RECREATIONS) {
    console.error(`❌ [Supabase] 已达到最大重建次数 ${MAX_RECREATIONS}，停止重建`);
    return;
  }

  recreationCount++;
  console.log(`🔄 [Supabase] 开始第 ${recreationCount} 次重建客户端...`);

  // 创建新客户端
  const newClient = createSupabaseClient();
  rawSupabase = newClient;
  clientCreationTime = Date.now();

  console.log(`✅ [Supabase] 客户端重建完成`);
}

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
              // 添加方法调用日志
              const className = obj.constructor?.name || 'Object';
              console.log(`🔗 [Supabase Nested Proxy] ${className}.${key} called`, args);

              // 特殊处理 getSession 调用
              let sessionId: string | undefined;
              let requestDetected = false;

              if (key === 'getSession' && className === 'AuthClient') {
                console.log(`🎯 [Supabase Nested Proxy] 检测到 getSession 调用，开始监控网络请求`);

                // 记录请求开始
                sessionId = requestTracker.trackRequest('GET', supabaseUrl + '/auth/v1/user');

                // 创建一个 Promise 来检测是否真的发出了请求
                const requestDetection = new Promise<void>((resolve) => {
                  // 使用 MutationObserver 检测 DOM 变化（如果有的话）
                  // 或者使用 Performance API 检测网络请求
                  const checkRequest = () => {
                    // 检查是否有新的网络请求
                    if (performance.getEntriesByType && performance.getEntriesByType('resource')) {
                      const recentEntries = performance.getEntriesByType('resource').filter(
                        (entry: PerformanceEntry) => {
                          const resourceEntry = entry as PerformanceResourceTiming;
                          return resourceEntry.initiatorType === 'fetch' ||
                                 resourceEntry.initiatorType === 'xmlhttprequest';
                        }
                      );

                      // 检查是否有最近的对 supabase 的请求
                      const supabaseRequests = recentEntries.filter(
                        (entry: PerformanceEntry) =>
                          entry.name.includes(supabaseUrl.replace('https://', '').replace('http://', ''))
                      );

                      if (supabaseRequests.length > 0) {
                        requestDetected = true;
                        console.log(`✅ [Supabase Nested Proxy] 检测到网络请求:`, supabaseRequests.map(e => e.name));
                        resolve();
                        return;
                      }
                    }
                  };

                  // 立即检查一次
                  checkRequest();

                  // 每 100ms 检查一次，最多检查 5 秒
                  const interval = setInterval(checkRequest, 100);
                  setTimeout(() => {
                    clearInterval(interval);
                    if (!requestDetected) {
                      console.warn(`⚠️ [Supabase Nested Proxy] 5秒内未检测到网络请求`);
                      resolve();
                    }
                  }, 5000);
                });

                // 在方法执行前记录当前客户端年龄
                const clientAge = Date.now() - clientCreationTime;
                console.log(`📊 [Supabase Nested Proxy] 客户端年龄: ${clientAge}ms, 重建次数: ${recreationCount}`);
              }

              try {
                const startTime = Date.now();
                const result = val.apply(obj, args);

                if (result && typeof result.then === 'function') {
                  console.log(`⏳ [Supabase Nested Proxy] ${key} returned Promise, waiting...`);

                  // 如果是 getSession，添加额外的检测逻辑
                  if (key === 'getSession' && className === 'AuthClient') {
                    // 给它一点时间来发出请求
                    setTimeout(() => {
                      // 这里可以检查 fetch 队列或其他指标
                      if (!requestDetected && recreationCount < MAX_RECREATIONS) {
                        console.warn(`⚠️ [Supabase Nested Proxy] getSession 调用后未检测到网络请求，可能需要重建客户端`);
                      }
                    }, 1000);
                  }

                  return result.then((data: any) => {
                    console.log(`✅ [Supabase Nested Proxy] ${key} Promise resolved (${Date.now() - startTime}ms)`, data);

                    // 如果是 getSession，标记请求完成
                    if (key === 'getSession' && className === 'AuthClient') {
                      requestTracker.resolveRequest(sessionId);
                    }

                    // 处理 Supabase 的 { data, error } 返回格式
                    if (data && typeof data === 'object' && 'error' in data && data.error) {
                      if (SupabaseErrorTranslator.isSupabaseError(data.error)) {
                        try {
                          const currentLang = i18nService.getCurrentLanguage();
                          const translatedMessage = SupabaseErrorTranslator.translate(data.error, currentLang);
                          console.log(`🌐 [Supabase Nested Proxy] Error translated to ${currentLang}`);
                          return {
                            ...data,
                            error: {
                              ...data.error,
                              message: translatedMessage
                            }
                          };
                        } catch (translateError) {
                          console.warn(`⚠️ [Supabase Nested Proxy] Translation failed:`, translateError);
                        }
                      }
                    }
                    return data;
                  }).catch((error: any) => {
                    console.error(`❌ [Supabase Nested Proxy] ${key} Promise rejected (${Date.now() - startTime}ms):`, error);

                    // 如果是 getSession 且错误是超时相关，考虑重建客户端
                    if (key === 'getSession' && className === 'AuthClient') {
                      if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
                        console.warn(`⚠️ [Supabase Nested Proxy] getSession 超时，考虑重建客户端`);
                      }
                    }

                    if (SupabaseErrorTranslator.isSupabaseError(error)) {
                      try {
                        const translatedError = new Error(SupabaseErrorTranslator.translate(error));
                        Object.assign(translatedError, {
                          originalError: error,
                          code: error.code,
                          status: error.status
                        });
                        throw translatedError;
                      } catch (translateError) {
                        console.warn(`⚠️ [Supabase Nested Proxy] Error translation failed:`, translateError);
                      }
                    }
                    throw error;
                  });
                }

                // 处理同步返回的结果
                console.log(`✅ [Supabase Nested Proxy] ${key} sync result (${Date.now() - startTime}ms)`, result);
                if (result && typeof result === 'object' && 'error' in result && result.error) {
                  if (SupabaseErrorTranslator.isSupabaseError(result.error)) {
                    try {
                      const currentLang = i18nService.getCurrentLanguage();
                      const translatedMessage = SupabaseErrorTranslator.translate(result.error, currentLang);
                      console.log(`🌐 [Supabase Nested Proxy] Sync error translated to ${currentLang}`);
                      return {
                        ...result,
                        error: {
                          ...result.error,
                          message: translatedMessage
                        }
                      };
                    } catch (translateError) {
                      console.warn(`⚠️ [Supabase Nested Proxy] Sync error translation failed:`, translateError);
                    }
                  }
                }

                return result;
              } catch (error: any) {
                console.error(`❌ [Supabase Nested Proxy] ${key} sync error:`, error);
                // 重新抛出错误，不要吞噬
                throw error;
              }
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

// 手动触发客户端重建（调试用）
export const forceRecreateSupabaseClient = () => {
  console.log('🔧 [Supabase] 手动触发客户端重建...');
  recreationCount = 0; // 重置计数器
  triggerClientRecreation();
};

// 获取客户端状态信息
export const getSupabaseClientInfo = () => {
  return {
    clientAge: Date.now() - clientCreationTime,
    recreationCount,
    supabaseUrl: getSupabaseUrl(),
    isConfigured: isSupabaseConfigured(),
    hasEnvVars: !!(supabaseUrl && supabaseAnonKey)
  };
};