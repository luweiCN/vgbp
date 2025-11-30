# OpenCode 代理指令

为在此项目中工作的 AI 编码助手提供指导。

## 构建和测试命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 部署到 GitHub Pages
npm run deploy
```

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: React Router v7
- **后端**: Supabase (数据库 + 实时同步)
- **AI 服务**: Google Gemini API
- **部署**: GitHub Pages

## 代码风格指南

### 导入规范
- React 相关导入优先：`import React, { useState, useCallback } from 'react';`
- 第三方库次之：`import { BrowserRouter } from 'react-router-dom';`
- 本地模块最后：`import { useAuth } from '../hooks/useAuth';`
- 使用 `@/` 别名引用根目录：`import { Hero } from '@/types';`

### 组件规范
- 使用函数式组件 + TypeScript 接口
- Props 接口以 `Props` 结尾：`interface AuthFormProps { onSuccess?: () => void; }`
- 组件文件使用 PascalCase：`AuthForm.tsx`
- 导出命名组件：`export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {`

### 状态管理
- 优先使用 React Hooks：`useState`, `useCallback`, `useEffect`
- 自定义 Hooks 放在 `hooks/` 目录，以 `use` 开头
- 复杂状态使用自定义 Hook 封装

### 样式规范
- 使用 Tailwind CSS 类名
- 响应式设计：`sm:`, `md:`, `lg:` 前缀
- 深色主题优先：`bg-gray-800`, `text-white`
- 交互状态：`hover:`, `focus:`, `disabled:`

### 错误处理
- 使用 try-catch 包装异步操作
- 错误状态通过 useState 管理
- 用户友好的错误提示，避免技术术语

### 类型定义
- 所有数据结构定义在 `types.ts`
- 使用枚举表示固定值：`HeroRole`, `AttackType`
- 接口属性可选性明确：`avatar?: string`

### 文件命名
- 组件：PascalCase.tsx (如 `AuthForm.tsx`)
- Hook：camelCase.ts (如 `useAuth.ts`)
- 工具函数：camelCase.ts (如 `realtimeDiagnostic.ts`)
- 页面：PascalCase.tsx (如 `HomePage.tsx`)

### 环境变量
- Vite 环境变量以 `VITE_` 开头
- 在 `vite.config.ts` 中定义全局变量
- 敏感信息使用 `.env.local`，不提交到版本控制

## 项目结构

```
components/     # 可复用组件
pages/         # 页面组件
hooks/         # 自定义 Hooks
services/      # 外部服务集成
utils/         # 工具函数
types.ts       # 类型定义
data/          # 静态数据
```

## 开发注意事项

- 使用中文注释和用户界面文本
- 遵循 Supabase RLS (Row Level Security) 规则
- WebSocket 连接需要正确处理连接状态
- 图片资源使用相对路径或 CDN
- 代码提交前运行 `npm run build` 确保构建成功