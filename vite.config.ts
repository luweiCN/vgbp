import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // GitHub Pages 部署配置
      base: mode === 'production' ? '/' : '/', // 自定义域名使用根路径
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // 代理 Supabase REST API
          '/rest/v1': {
            target: 'https://hvbqzfdmmoupwvbwegug.supabase.co',
            changeOrigin: true,
            secure: true,
          },
          // 代理 Realtime WebSocket（关键：启用 ws: true）
          '/realtime/v1': {
            target: 'wss://hvbqzfdmmoupwvbwegug.supabase.co',
            changeOrigin: true,
            ws: true, // 启用 WebSocket 代理
          },
          // 直接代理 WebSocket 连接
          '/v1/websocket': {
            target: 'wss://hvbqzfdmmoupwvbwegug.supabase.co',
            changeOrigin: true,
            ws: true, // 关键：WebSocket 升级支持
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
