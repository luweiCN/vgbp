# Change: Add PWA Support

## Why
为 Vainglory 战术选角助手添加 PWA（Progressive Web App）支持，以提供接近原生应用的移动端体验，包括离线访问、桌面图标安装、快速启动等特性，提升用户在移动设备上的使用体验。

## What Changes
- 添加 Web App Manifest 配置（支持中英文应用名称和描述）
- 集成 vite-plugin-pwa 插件和 Workbox
- 配置 Service Worker 实现资源缓存和离线访问
- 生成多尺寸应用图标（启动图标和主屏幕图标）
- 添加 PWA 安装提示 UI 组件
- 更新 HTML meta 标签支持 PWA 特性
- 配置应用主题色和显示模式

## Impact
- 涉及的规格: 新增 `pwa` 功能规格
- 涉及的代码:
  - `vite.config.ts` - 添加 PWA 插件配置
  - `index.html` - 添加 PWA meta 标签和 manifest 链接
  - `public/` 目录 - 添加图标和 manifest 文件
  - `App.tsx` - 添加安装提示组件
- 依赖变更: 添加 `vite-plugin-pwa` 开发依赖
- 构建输出: 生成额外的 service worker 和 manifest 文件