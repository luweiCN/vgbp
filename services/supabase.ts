import { createClient } from '@supabase/supabase-js';

// 从环境变量获取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Online features will be unavailable.');
}

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// 导出类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
        };
        Update: {
          email?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          name: string;
          description?: string;
          owner_id: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          owner_id: string;
          is_public?: boolean;
        };
        Update: {
          name?: string;
          description?: string;
          is_public?: boolean;
        };
      };
      room_participants: {
        Row: {
          room_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          room_id: string;
          user_id: string;
        };
        Update: never;
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