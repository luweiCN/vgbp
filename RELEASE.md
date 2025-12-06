# 发布指南

## 🚀 自动发布（推荐）

### GitHub Actions 自动发布

当你合并 PR 到 `main` 分支时，会自动触发发布流程：

1. **创建 PR 并合并到 main**
   - GitHub Actions 自动检测 PR 合并
   - 自动运行 `npm run release`
   - 自动提交版本更新到 Git
   - 创建 Git 标签和 GitHub Release

2. **Vercel 自动部署**
   - Vercel 检测到 main 分支更新
   - 自动构建新版本
   - 你在 Vercel 控制台手动设为生产版本

### 手动发布（备用）

如果你需要手动发布：

1. **开发测试**
   ```bash
   npm run dev
   ```

2. **本地准备发布**
   ```bash
   npm run release
   ```
   这个脚本会：
   - 自动更新版本号（补丁版本 +1）
   - 更新 manifest.json 版本和构建时间
   - 本地构建测试，确保代码可以正常构建

3. **提交代码到 Git**
   ```bash
   git add .
   git commit -m "release: v{新版本号}"
   git push origin main
   ```

## 📋 发布步骤详解

### 第一步：发布准备
```bash
npm run release
```
输出示例：
```
✅ 版本已更新: 0.0.1 → 0.0.2
📦 package.json 和 manifest.json 已更新
✅ 版本更新和构建测试完成！
```

### 第二步：Git 提交
脚本会提示你运行：
```bash
git add .
git commit -m "release: v0.0.2"
git push origin main
```

### 第三步：Vercel 部署
- Vercel 自动检测 main 分支更新
- 自动运行构建
- 构建完成后在 Vercel 控制台显示新版本
- 你手动将新版本设为生产环境

### 第四步：验证
- 访问生产环境 URL
- 检查 PWA 功能
- 验证版本更新

### 其他平台部署：

- **GitHub Pages**: `npm run build:github-pages` 然后推送 gh-pages 分支
- **其他平台**: `npm run release` 然后部署 dist/ 目录

### 单独更新版本（不构建）：

```bash
npm run update-version
```

## 📝 版本管理

- **自动版本号**: 脚本会自动递增补丁版本（如 0.0.1 → 0.0.2）
- **手动设置**: 如需设置特定版本，请编辑 package.json 中的 version 字段
- **PWA 更新**: 每次发布后，用户的 PWA 会在下次访问时检测到新版本

## 🔍 PWA 更新机制

用户的 PWA 会：
1. 后台检查新版本
2. 发现新版本时自动下载
3. 提示用户刷新应用
4. 更新到最新版本

## 📁 构建文件

发布完成后，`dist/` 目录包含：
- 静态资源文件
- Service Worker
- PWA manifest
- 优化的 HTML/CSS/JS

直接将 `dist/` 目录部署到你的托管平台即可。