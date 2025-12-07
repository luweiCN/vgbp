import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'child_process';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // 通过 NPM_SCRIPT 环境变量检测构建类型
    // build:github-pages 会设置 NPM_SCRIPT=github-pages
    const npmScript = process.env.npm_config_script || process.env.npm_lifecycle_event;
    const isGitHubPages = npmScript === 'build:github-pages';

    // 生成构建信息
    const getEnvironment = () => {
        if (mode) return mode;
        if (process.env.NODE_ENV) return process.env.NODE_ENV;
        if (npmScript && npmScript.includes('build')) return 'production';
        return 'development';
    };

    const getCurrentGitCommit = () => {
        try {
            return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 7);
        } catch (error) {
            return 'unknown';
        }
    };

    // 读取package.json版本
    const packageJsonPath = path.resolve(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const version = packageJson.version;

    const buildInfo = {
        version,
        buildTime: new Date().toISOString(),
        environment: getEnvironment(),
        gitCommit: getCurrentGitCommit()
    };

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
            target: env.VITE_SUPABASE_URL || 'https://sxkozhhlhvxdnwirbubw.supabase.co',
            changeOrigin: true,
            secure: true,
          },
          // 代理 Realtime WebSocket（关键：启用 ws: true）
          '/realtime/v1': {
            target: (env.VITE_SUPABASE_URL?.replace('https://', 'wss://') || 'wss://sxkozhhlhvxdnwirbubw.supabase.co'),
            changeOrigin: true,
            ws: true, // 启用 WebSocket 代理
          },
          // 直接代理 WebSocket 连接
          '/v1/websocket': {
            target: (env.VITE_SUPABASE_URL?.replace('https://', 'wss://') || 'wss://sxkozhhlhvxdnwirbubw.supabase.co'),
            changeOrigin: true,
            ws: true, // 关键：WebSocket 升级支持
          },
        },
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          strategies: 'generateSW',
          includeAssets: ['web-app-manifest-192x192.png', 'web-app-manifest-512x512.png', 'favicon-96x96.png', 'apple-touch-icon.png', 'favicon.svg'],
          devOptions: {
            enabled: true,
            type: 'module'
          },
          // 强制更新图标的缓存策略
          workbox: {
            runtimeCaching: [
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|ico)$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'icon-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                  }
                }
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        'process.env.IS_GITHUB_PAGES': JSON.stringify(isGitHubPages),
        // 关键：添加 import.meta.env 支持，确保与代码使用方式一致
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        'import.meta.env.IS_GITHUB_PAGES': JSON.stringify(isGitHubPages),
        // 注入构建信息
        '__BUILD_INFO__': JSON.stringify(buildInfo)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
