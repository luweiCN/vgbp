# OpenCode 代理指令

为在此项目中工作的 AI 编码助手提供指导。

## 🌐 语言偏好要求

**重要**：项目主要面向中文用户，所有 AI 助手必须使用中文与用户交流，除非用户明确要求使用英文。

### 交流语言标准

- **默认交流语言**：中文（普通话）
- **代码注释**：优先使用中文，技术术语保留英文
- **文档编写**：使用中文撰写，变量和函数名遵循编程约定
- **错误信息**：面向用户的错误信息使用中文
- **提交信息**：使用中文描述功能变更

请在所有交流中遵循此语言偏好，包括提案创建、代码实现、问题解答等所有环节。

## 构建和测试命令

```bash
# 开发服务器（默认端口 3000）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 部署到 GitHub Pages
npm run deploy

# 构建并部署到 GitHub Pages
npm run build:github-pages
```

## 技术栈

- **前端框架**: React 19.2.0 + TypeScript
- **构建工具**: Vite 6.2.0
- **样式**: TailwindCSS 4.1.17（通过 CDN 加载）
- **路由**: React Router v7.9.6
- **后端**: Supabase (数据库 + 实时同步)
- **AI 服务**: Google Gemini API (gemini-2.5-flash)
- **搜索增强**: pinyin-pro 3.27.0（拼音搜索支持）
- **图标**: Lucide React
- **部署**: GitHub Pages + Vercel 双平台支持

## 项目架构特点

### 单体架构设计

- **主组件集中化**: App.tsx 包含核心业务逻辑，但已模块化拆分
- **组件化设计**: 按功能模块拆分组件（认证、房间管理、英雄选择等）
- **状态管理**: React Hooks + 自定义 Hooks，复杂状态封装在自定义 Hooks 中
- **服务层分离**: 外部服务集成（Supabase、Gemini、用户检查）独立封装

### 多语言支持架构

- **轻量级 i18n 系统**: 自实现国际化服务，不引入重型第三方库
- **语言包管理**: JSON 格式语言包，支持嵌套键值对和参数化翻译
- **缓存策略**: 内存缓存 + localStorage 持久化，懒加载机制
- **类型安全**: 完整 TypeScript 类型定义，确保翻译键值类型安全

## 代码风格指南

### 导入规范

```typescript
// React 相关导入优先
import React, { useState, useCallback, useEffect } from "react";

// 第三方库次之
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// 本地模块最后
import { useAuth } from "../hooks/useAuth";
import { Hero } from "@/types";
import { i18nService } from "../i18n/services/i18n.service";
```

### 组件规范

- **函数式组件**: 使用 React.FC 类型
- **Props 接口**: 以 Props 结尾，明确可选属性

```typescript
interface AuthFormProps {
  onSuccess?: () => void;
  mode?: "login" | "register";
}

export const AuthForm: React.FC<AuthFormProps> = ({
  onSuccess,
  mode = "login",
}) => {
  // 组件实现
};
```

### 状态管理规范

- **优先使用 React Hooks**: useState, useCallback, useEffect
- **自定义 Hooks**: 复杂逻辑封装在 hooks/ 目录，以 use 开头
- **状态结构**: 扁平化状态结构，避免深度嵌套

### 多语言开发规范

- **翻译键命名**: 使用点分隔的层级结构，如 ui.auth.form.email
- **参数化翻译**: 使用 {{param}} 语法支持动态参数
- **错误处理**: 翻译用户可见的错误信息，技术日志保持英文
- **Hook 集成**: 使用 useI18n Hook 获取翻译函数

### 样式规范

- **TailwindCSS 类名**: 优先使用原子化类名
- **深色主题**: bg-gray-800, text-white, border-gray-700
- **响应式设计**: sm:, md:, lg: 前缀适配不同屏幕
- **交互状态**: hover:, focus:, disabled: 状态样式
- **渐变效果**: 使用 bg-gradient-to-r 创建视觉层次

### 错误处理规范

- **异步操作**: 使用 try-catch 包装，错误状态通过 useState 管理
- **用户友好**: 错误信息使用中文，避免技术术语
- **错误分类**: 区分网络错误、验证错误、业务逻辑错误
- **错误恢复**: 提供明确的错误恢复操作

## 项目结构详解

```
├── components/          # 可复用组件
│   ├── AuthForm.tsx    # 认证表单组件
│   ├── EmailStatusModals.tsx  # 邮箱状态模态框
│   ├── RoomManager.tsx # 房间管理主组件
│   └── ...
├── pages/              # 页面组件
│   ├── HomePage.tsx    # 首页
│   ├── RoomsPage.tsx   # 房间列表页
│   └── RoomPage.tsx    # 房间详情页
├── hooks/              # 自定义 Hooks
│   ├── useAuth.ts      # 认证状态管理
│   ├── useI18n.ts      # 多语言支持
│   └── useCountdown.ts # 倒计时功能
├── services/           # 外部服务集成
│   ├── supabase.ts     # Supabase 客户端
│   ├── geminiService.ts # AI 服务
│   └── userCheckService.ts # 用户状态检查
├── i18n/               # 多语言系统
│   ├── services/       # i18n 核心服务
│   ├── components/     # i18n React 组件
│   ├── hooks/          # i18n Hooks
│   └── types/          # i18n 类型定义
├── utils/              # 工具函数
├── types.ts            # 全局类型定义
├── constants.ts        # 常量定义
└── data/               # 静态数据
    └── heroes.ts       # 英雄数据
```

## 开发注意事项

### 多语言开发

- **语言包位置**: public/i18n/locales/ 目录
- **翻译键设计**: 使用语义化键名，便于理解和维护
- **参数化支持**: 使用 {{param}} 语法支持动态内容
- **回退机制**: 支持翻译键缺失时的回退策略
- **性能优化**: 懒加载语言包，避免初始加载时间过长

### Supabase 集成

- **RLS 策略**: 严格遵循行级安全策略
- **实时同步**: 正确处理 WebSocket 连接状态
- **错误处理**: 翻译 Supabase 错误消息，提供用户友好提示
- **类型安全**: 使用 TypeScript 类型确保数据结构一致性

### 环境配置

- **环境变量**: 必须在 .env.local 中配置敏感信息
- **构建配置**: Vite 配置支持双平台部署（GitHub Pages + Vercel）
- **代理设置**: 开发环境配置 Supabase API 代理
- **路径别名**: 使用 @/ 别名简化导入路径

### 性能优化

- **代码分割**: 使用 React.lazy 和 Suspense 进行组件懒加载
- **缓存策略**: 合理使用 React.memo、useMemo、useCallback
- **图片优化**: 使用 CDN 加载英雄头像，支持懒加载
- **包大小控制**: 避免引入不必要的依赖

### 测试和调试

- **开发工具**: 使用 React DevTools 进行组件调试
- **网络调试**: 使用浏览器开发者工具监控 API 调用
- **多语言测试**: 测试语言切换功能和翻译显示
- **响应式测试**: 验证移动端和桌面端显示效果

## 部署配置

### 双平台部署

- **GitHub Pages**: 使用 npm run build:github-pages 构建
- **Vercel**: 使用 npm run build:vercel 构建
- **路径配置**: GitHub Pages 需要配置子路径 /vgbp/
- **环境变量**: 部署时确保正确配置 Supabase 和 Gemini API 密钥

### 构建优化

- **资源压缩**: Vite 自动压缩 JS/CSS 资源
- **缓存策略**: 配置合适的缓存头
- **错误处理**: 404 页面重定向到 index.html
- **性能监控**: 使用 Vercel Analytics 监控性能

## OpenSpec 工作流

### 变更管理

- **提案创建**: 使用 OpenSpec 创建变更提案
- **任务跟踪**: 按照任务清单逐步实施
- **里程碑管理**: 分阶段完成大型功能
- **质量保证**: 每个里程碑完成后进行测试验证

### 多语言化流程

1. **文本分析**: 识别需要翻译的硬编码文本
2. **死代码清理**: 删除未使用的代码和导入
3. **翻译键设计**: 创建语义化的翻译键结构
4. **组件改造**: 集成 useI18n Hook 和翻译函数
5. **测试验证**: 验证语言切换功能和翻译准确性

## 重要提醒

- **始终使用中文** 与用户交流，除非明确要求使用英文
- **遵循项目约定** 保持代码风格和架构一致性
- **优先用户体验** 确保多语言切换流畅自然
- **测试驱动开发** 每个功能完成后进行充分测试
- **文档同步更新** 及时更新相关文档和注释

---

**最后更新**: 2025-12-05
**项目版本**: v0.0.0
