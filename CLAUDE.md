<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🌐 语言偏好设置

**重要**：项目主要面向中文用户，请使用中文与用户交流，除非用户明确要求使用英文。

### 交流语言规范
- **默认语言**：中文（普通话）
- **代码注释**：优先使用中文，必要时可使用英文
- **变量命名**：遵循 TypeScript/JavaScript 约定（英文）
- **文档说明**：使用中文撰写，技术术语保留英文原文
- **错误信息**：提供给用户的错误信息使用中文

### 项目概述

这是一个为 Vainglory（虚荣）MOBA 游戏开发的战术选角助手，使用 React + TypeScript + Vite 构建。应用帮助玩家追踪选择/禁用的英雄，并通过 AI 获得选角建议。

## 基础开发命令

```bash
# 安装依赖（最小化依赖：React、Google GenAI、TypeScript、Vite）
npm install

# 启动开发服务器（默认端口 3000）
npm run dev

# 生产环境构建
npm run build

# 预览生产构建
npm run preview
```

## 关键设置要求

### 环境变量配置
必须在项目根目录创建 `.env.local` 文件并设置：
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 开发环境注意事项
- 当前项目没有配置测试框架（如 Jest、Vitest）
- 没有代码检查工具（如 ESLint、Prettier）
- 依赖通过 CDN 的 import maps 加载，非传统 npm 包管理

## 架构概览

### 单体架构特点
- **主组件集中化**：`App.tsx` 包含了绝大部分业务逻辑（438 行，约 17KB）
- **极简组件设计**：整个项目只有 2 个组件（App + HeroCard）
- **状态管理**：使用本地 React useState，英雄选择通过 Set<string> 管理
- **AI 集成**：通过 Google GenAI SDK 提供结构化 JSON 响应

### 技术栈
- **前端**：React 19.2.0 + TypeScript
- **构建工具**：Vite 6.2.0
- **样式**：TailwindCSS（通过 CDN 加载）
- **AI 服务**：Google Gemini AI (gemini-2.5-flash)
- **依赖管理**：Import maps + CDN (aistudiocdn.com)

## 关键文件说明

### 核心文件
- `App.tsx` - 主应用组件，包含所有业务逻辑、状态管理和 UI 渲染
- `components/HeroCard.tsx` - 唯一的可重用组件，英雄卡片交互界面
- `services/geminiService.ts` - AI 集成层，封装 Google GenAI 调用
- `constants.ts` - 英雄数据库（50+ 英雄，中英双语，按角色分类）
- `types.ts` - TypeScript 接口定义

### 配置文件
- `vite.config.ts` - Vite 配置，包含环境变量注入和路径别名 (@/*)
- `tsconfig.json` - TypeScript 配置，ES2022 目标，DOM 支持
- `package.json` - 最小化依赖配置

## 重要开发模式

### 数据流模式
```
用户选择英雄 → 更新 selectedHeroIds Set → 触发 AI 分析 → 显示结构化建议
```

### 组件开发模式
- **最小组件提取**：只有真正需要复用时才创建独立组件
- **内联事件处理**：大部分处理逻辑直接写在主组件中
- **条件渲染**：模态框和动态 UI 通过状态控制渲染

### 状态管理模式
```typescript
// 主要状态结构
{
  selectedHeroIds: Set<string>,    // 选中的英雄 ID
  searchTerm: string,              // 搜索关键词
  aiLoading: boolean,              // AI 加载状态
  aiAdvice: AIAdviceResponse | null, // AI 分析结果
  showAdviceModal: boolean,        // 建议模态框显示状态
  showShareModal: boolean          // 分享模态框显示状态
}
```

## AI 集成详情

### Gemini AI 配置
- 使用 `gemini-2.5-flash` 模型
- 采用专业电竞教练人设进行系统提示
- 强制结构化 JSON 响应格式

### 响应结构
```typescript
interface AIAdviceResponse {
  analysis: string;        // 战术分析
  suggestedPicks: string[]; // 3 个推荐英雄
  threats: string[];       // 潜在威胁
}
```

## 双语支持实现

### 英雄数据显示
- **主显示**：中文名字 (cnName)
- **副显示**：英文名字 (name)
- **搜索支持**：支持中英文搜索
- **面向用户**：主要服务中文用户群体，兼顾英文用户

## 样式和 UI 特点

### TailwindCSS 使用
- 通过 CDN 加载，无需本地构建
- 深色主题，蓝色强调色
- 响应式设计，移动端优先
- 自定义滚动条样式

### 交互模式
- 基于模态框的交互（AI 建议、分享功能）
- 英雄卡片的悬停和选中状态效果
- 平滑的动画过渡效果

## 开发注意事项

### 代码组织原则
- 扁平目录结构，避免过度嵌套
- 常量数据集中管理（constants.ts）
- 服务层分离（services/）
- 类型定义集中（types.ts）

### 性能考虑
- 使用 Set 管理选中状态，避免重复渲染
- CDN 依赖减少本地包大小
- 图片资源从 GitHub 仓库动态加载

### 扩展性建议
- 当前单体架构适合单页应用
- 如需扩展功能，建议逐步提取组件
- 复杂状态管理可考虑引入外部方案
- 建议添加测试框架和代码检查工具

## 构建和部署

### 本地开发
```bash
npm run dev    # 开发服务器，支持热重载
```

### 生产构建
```bash
npm run build  # 构建到 dist/ 目录
npm run preview  # 本地预览生产构建
```

### 环境变量
构建时会注入 `GEMINI_API_KEY`，确保在部署环境中正确配置。

## PWA 支持

### PWA 功能概述
应用已实现 Progressive Web App (PWA) 支持，提供接近原生应用的体验：
- 可安装到设备主屏幕
- 支持离线访问缓存的内容
- 快速启动和全屏显示模式
- 后台自动更新机制

### PWA 配置文件
- `vite.config.ts` - Vite PWA 插件配置，包含 manifest 和 service worker 设置
- `index.html` - PWA meta 标签和 manifest 链接
- `public/pwa-icon.svg` - PWA 应用图标

### 关键组件
- `components/PWAInstallPrompt.tsx` - PWA 安装提示组件
- `components/OfflineIndicator.tsx` - 离线状态指示器

### PWA 开发注意事项
1. **Service Worker**：
   - 使用 `vite-plugin-pwa` 自动生成
   - 预缓存静态资源（js、css、html）
   - 支持自动更新策略

2. **Manifest 配置**：
   - 支持中英文应用名称和描述
   - 适配 GitHub Pages 和 Vercel 部署路径
   - 主题色与应用 UI 保持一致

3. **缓存策略**：
   - 静态资源使用 Cache First
   - API 请求使用 Network First
   - 动态内容需要谨慎处理

## 多语言开发规范 (重要)

### 项目国际化状态
✅ **已完整实现多语言支持**
- 支持中文(zh-CN)和英文(en-US)
- 自研 i18n 系统，基于 React Context
- 语言包预加载优化
- 完整的 UI 组件国际化

### 开发新功能时的多语言要求

#### 1. 文本国际化
**所有用户可见的文本必须使用翻译函数：**

```typescript
// ❌ 错误示例
<button>确认</button>
<p>请选择英雄</p>

// ✅ 正确示例
import { useI18n } from '@/i18n/components/I18nProvider';

const { t } = useI18n();
<button>{t('common.confirm')}</button>
<p>{t('hero.selectPrompt')}</p>
```

#### 2. 翻译键命名规范
```
格式: 模块.组件.功能.具体文本
示例:
- ui.common.confirm
- ui.roomList.filter.searchPlaceholder
- hero.modal.reset.warning
- error.auth.invalidCredentials
```

#### 3. 添加新翻译步骤
1. 更新 `/public/i18n/locales/zh-CN.json`
2. 更新 `/public/i18n/locales/en-US.json`
3. 保持键名完全一致
4. 英文翻译要语义准确

#### 4. 使用 Hook
```typescript
import { useI18n } from '@/i18n/components/I18nProvider';

const { t, language, setLanguage } = useI18n();

// 简单翻译
t('ui.components.entryPage.modes.local')

// 带参数翻译
t('pagination.currentPageInfo', { current: 1, total: 10 })

// 复数形式
tc('items.count', itemCount, { count: itemCount })
```

#### 5. 性能注意事项
- 使用 React.memo 优化包含翻译的组件
- 复杂翻译使用 useMemo 缓存结果
- 避免在渲染路径中创建大量对象

### 已实现的 i18n 功能
- 语言自动检测和切换
- localStorage 持久化
- 跨标签页同步
- 语言包预加载
- 错误处理和回退
- React DevTools 调试支持

### i18n 文件结构
```
/i18n/
├── services/
│   └── i18n.service.ts      # 核心服务，单例模式
├── components/
│   ├── I18nProvider.tsx     # Context Provider
│   └── LanguageSelector.tsx # 语言切换器
└── types.ts                 # TypeScript 类型定义

/public/i18n/locales/
├── zh-CN.json               # 中文语言包
└── en-US.json               # 英文语言包
```

### 调试多语言
- React DevTools 中查看 I18nProvider 状态
- Console 中查看语言包加载日志
- 切换语言检查所有 UI 更新

### 扩展新语言（如需要）
1. 创建新的语言包文件 `/public/i18n/locales/[lang].json`
2. 更新 `i18n.service.ts` 支持新语言
3. 更新类型定义
4. 更新 LanguageSelector 组件

## Coolify 部署（Nixpacks）

### Nixpacks 配置
项目已配置 `nixpacks.toml` 文件用于在 Coolify 平台进行静态站点部署。

#### 部署特点
- **部署类型**：静态站点托管
- **Web 服务器**：Nginx
- **构建环境**：Node.js 22
- **输出目录**：dist

#### 必需的环境变量
在 Coolify 中配置以下环境变量：

```env
# 必需的 API 密钥
GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 构建环境（默认设置）
NODE_ENV=production
```

#### 部署步骤

1. **准备仓库**
   ```bash
   # 确保 nixpacks.toml 已提交到仓库
   git add nixpacks.toml
   git commit -m "Add Nixpacks configuration for Coolify deployment"
   git push
   ```

2. **在 Coolify 中配置**
   - 连接 GitHub 仓库
   - 选择服务类型：Static Site
   - 设置构建命令：保持默认（Nixpacks 自动处理）
   - 设置输出目录：dist
   - 配置环境变量

3. **部署验证**
   - 检查构建日志确认成功
   - 验证所有功能正常工作
   - 测试 PWA 安装功能

#### Nixpacks 配置说明

`nixpacks.toml` 文件包含以下配置：

1. **构建流程**
   - 运行 `copy-i18n.mjs` 准备国际化文件
   - 执行 `npm run build` 构建生产版本
   - 生成 Nginx 配置文件

2. **Nginx 优化**
   - SPA 路由支持（所有路由返回 index.html）
   - PWA 资源不缓存策略（sw.js、webmanifest）
   - 静态资源长期缓存（1年）
   - Gzip 压缩配置

3. **安全配置**
   - 清理敏感文件（.env）
   - 合理的资源限制

#### 常见问题

**构建失败**
- 检查 `copy-i18n.mjs` 是否存在且可执行
- 验证所有依赖已正确安装
- 查看构建日志中的错误信息

**PWA 功能异常**
- 确认 Service Worker 文件（sw.js）已生成
- 检查 site.webmanifest 是否可访问
- 验证 HTTPS 证书（PWA 需要）

**环境变量问题**
- 确保在 Coolify 中设置了所有必需的环境变量
- API 密钥不要包含在代码中
- 使用 `process.env.VITE_` 前缀访问环境变量

#### 性能优化建议

1. **CDN 加速**
   - Coolify 自动提供 CDN
   - 静态资源已配置长期缓存

2. **监控**
   - 添加 Google Analytics 或其他监控工具
   - 设置错误追踪（如 Sentry）

3. **持续集成**
   - 配置自动部署（推送时触发）
   - 设置部署前检查（测试、lint）