# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

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