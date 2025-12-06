<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1o2W87ScQFRDehIQ6GwzHXd0tD0ZpnUDl

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# 双平台部署测试

## 🚀 部署架构
- **GitHub Pages**: https://luweiCN.github.io/vgbp
- **Vercel**: https://vgbp-xxxx.vercel.app

## 📋 配置状态
- ✅ GitHub Actions 工作流配置完成
- ✅ GitHub Pages 环境变量设置完成  
- ✅ Vercel 部署配置完成
- ✅ Supabase 域名白名单配置完成

## 🎯 功能特性
- ✅ 英雄选择和禁用追踪
- ✅ AI 助手战术建议
- ✅ Supabase 数据同步
- ✅ 实时 WebSocket 连接
- ✅ 双平台并行部署
- ✅ **PWA 支持** - 可安装到桌面/主屏幕，支持离线访问

## 📱 PWA 功能
应用已支持 Progressive Web App (PWA)，提供接近原生应用的体验：

### 安装方式
1. **自动安装提示**：在支持的浏览器中访问应用后会显示安装提示
2. **手动安装**：
   - Chrome/Edge：点击地址栏右侧的安装图标
   - Safari：点击分享按钮 → "添加到主屏幕"
   - Firefox：菜单 → "安装此站点为应用"

### PWA 特性
- **离线访问**：缓存静态资源，支持离线使用
- **快速启动**：像原生应用一样迅速启动
- **全屏体验**：无浏览器地址栏干扰
- **自动更新**：后台检测并提示更新

### 技术实现
- 使用 `vite-plugin-pwa` 插件
- Service Worker 资源缓存
- Web App Manifest 配置
- 支持深色主题和中英文界面

