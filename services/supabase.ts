import { createClient } from '@supabase/supabase-js';

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

// 创建 Supabase 客户端，启用 Realtime 功能
export const supabase = createClient(getSupabaseUrl(), supabaseAnonKey || '', {
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

// 实用工具函数
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  return error?.message || 'An unknown error occurred';
};