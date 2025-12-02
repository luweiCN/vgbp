import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // 通过 NPM_SCRIPT 环境变量检测构建类型
    // build:github-pages 会设置 NPM_SCRIPT=github-pages
    const npmScript = process.env.npm_config_script || process.env.npm_lifecycle_event;
    const isGitHubPages = npmScript === 'build:github-pages';

    // 构建时调试信息
    console.log('🔧 Vite 构建调试信息:');
    console.log('  mode:', mode);
    console.log('  npmScript:', npmScript);
    console.log('  isGitHubPages:', isGitHubPages);
    console.log('  base path:', isGitHubPages ? '/vgbp/' : '/');

    return {
      // 双平台部署配置
      // GitHub Pages 使用子路径，Vercel 使用根路径
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
        'process.env.IS_GITHUB_PAGES': JSON.stringify(isGitHubPages),
        // 关键：添加 import.meta.env 支持，确保与代码使用方式一致
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        'import.meta.env.IS_GITHUB_PAGES': JSON.stringify(isGitHubPages)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
