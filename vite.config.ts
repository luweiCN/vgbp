import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // 检测是否是 GitHub Pages 构建
    // GitHub Actions 会设置 GITHUB_ACTIONS=true，GitHub Pages 需要特殊处理
    const isGitHubPages = process.env.GITHUB_ACTIONS === '1';

    return {
      // 双平台部署配置
      // GitHub Pages 使用子路径，其他平台（Vercel）使用根路径
      base: isGitHubPages ? '/vgbp/' : '/',
      build: {
        assetsDir: 'assets',
        rollupOptions: {
          output: {
            assetFileNames: 'assets/[name]-[hash][extname]',
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js'
          }
        }
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // 代理 Supabase REST API
          '/rest/v1': {
            target: env.VITE_SUPABASE_URL || 'https://hvbqzfdmmoupwvbwegug.supabase.co',
            changeOrigin: true,
            secure: true,
          },
          // 代理 Realtime WebSocket（关键：启用 ws: true）
          '/realtime/v1': {
            target: (env.VITE_SUPABASE_URL?.replace('https://', 'wss://') || 'wss://hvbqzfdmmoupwvbwegug.supabase.co'),
            changeOrigin: true,
            ws: true, // 启用 WebSocket 代理
          },
          // 直接代理 WebSocket 连接
          '/v1/websocket': {
            target: (env.VITE_SUPABASE_URL?.replace('https://', 'wss://') || 'wss://hvbqzfdmmoupwvbwegug.supabase.co'),
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
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        'process.env.GITHUB_ACTIONS': JSON.stringify(isGitHubPages),
        // 关键：添加 import.meta.env 支持，确保与代码使用方式一致
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        'import.meta.env.GITHUB_ACTIONS': JSON.stringify(isGitHubPages)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
