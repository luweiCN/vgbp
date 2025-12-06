## 实施任务清单

### 1. 准备工作和依赖安装
- [x] 1.1 安装 vite-plugin-pwa 依赖
  ```bash
  npm install --save-dev vite-plugin-pwa
  ```
- [x] 1.2 检查并更新 package.json 的 type: "module" 配置（如需要）

### 2. 配置 Vite PWA 插件
- [x] 2.1 在 vite.config.ts 中导入并配置 VitePWA 插件
- [x] 2.2 配置 manifest 选项（应用名称、描述、图标、主题色）
- [x] 2.3 配置 workbox 缓存策略（预缓存清单、运行时缓存）
- [x] 2.4 配置开发环境选项（devOptions）

### 3. 创建应用图标
- [x] 3.1 设计或生成 512x512 的基础图标
- [x] 3.2 使用 PWA 图标生成工具创建多尺寸图标
- [x] 3.3 将图标文件放置到 public/icons/ 目录
- [x] 3.4 在 manifest 中配置图标路径和尺寸

### 4. 更新 HTML 配置
- [x] 4.1 在 index.html 中添加 PWA 相关的 meta 标签
- [x] 4.2 添加主题色、viewport 和应用名称 meta
- [x] 4.3 链接 manifest.json 文件
- [x] 4.4 添加 iOS 专用 meta 标签支持

### 5. 实现 PWA 安装提示组件
- [x] 5.1 创建 components/PWAInstallPrompt.tsx 组件
- [x] 5.2 监听 beforeinstallprompt 事件
- [x] 5.3 实现安装按钮 UI 和交互逻辑
- [x] 5.4 在 App.tsx 中集成安装提示组件
- [x] 5.5 添加国际化支持（安装按钮文本）

### 6. 配置 Service Worker 策略
- [x] 6.1 配置静态资源预缓存（Precaching）
- [x] 6.2 配置动态内容的运行时缓存策略
- [x] 6.3 配置离线回退页面
- [x] 6.4 配置更新策略和用户提示

### 7. 添加离线功能
- [x] 7.1 创建离线提示组件
- [x] 7.2 检测在线/离线状态
- [x] 7.3 在应用中显示连接状态
- [x] 7.4 缓存用户数据（如必要）

### 8. 测试和验证
- [x] 8.1 使用 Chrome DevTools 测试 PWA 功能
  - 检查 Manifest 加载
  - 验证 Service Worker 注册
  - 测试离线功能
  - 验证安装流程
- [x] 8.2 在移动设备浏览器上测试
- [x] 8.3 测试从主屏幕启动的功能
- [x] 8.4 验证缓存策略和更新机制

### 9. 更新语言包
- [x] 9.1 在 zh-CN.json 中添加 PWA 相关翻译
- [x] 9.2 在 en-US.json 中添加 PWA 相关翻译
  - 安装提示文本
  - 离线状态提示
  - 更新提示文本

### 10. 文档和部署
- [x] 10.1 更新 README.md 添加 PWA 功能说明
- [x] 10.2 更新 CLAUDE.md 文档
- [x] 10.3 验证 GitHub Pages 部署支持
- [x] 10.4 验证 Vercel 部署支持

### 11. 性能优化
- [x] 11.1 优化图标文件大小
- [x] 11.2 配置缓存过期策略
- [x] 11.3 测试首次加载性能
- [x] 11.4 验证 Lighthouse PWA 分数

### 12. 发布自动化 (新增)
- [x] 12.1 创建版本号管理脚本
- [x] 12.2 创建发布脚本
- [x] 12.3 配置 GitHub Actions 自动发布
- [x] 12.4 适配 Vercel 部署流程

### 13. 页面背景色优化 (新增)
- [x] 13.1 配置不同页面的背景色
- [x] 13.2 修复 iOS 安全区域显示问题
- [x] 13.3 优化页面头部毛玻璃效果

## 注意事项
1. **构建顺序**: 确保 Vite 配置正确，避免与现有 Supabase 代理冲突
2. **缓存策略**: 需要平衡缓存性能和内容新鲜度
3. **用户体验**: 安装提示不应过于频繁，尊重用户选择
4. **测试覆盖**: 在不同设备和浏览器上充分测试
5. **国际化**: 所有 PWA 相关 UI 都需要支持中英文
6. **dev-dist 目录**: Vite PWA 插件在开发模式生成的 Service Worker 文件，用于本地开发测试