# Change: 使用 Lucide 图标库替换自定义 SVG 图标

## Why
项目目前大量使用内联 SVG 图标，导致代码量增大，维护困难。使用 Lucide React 图标库可以：
- 减少代码量，提高可维护性
- 统一图标风格和交互行为
- 提供更好的性能（优化过的 SVG）
- 支持更多开箱即用的图标

## What Changes
- **BREAKING**: 替换所有内联 SVG 为 Lucide 图标组件
- 移除自定义 SVG 代码，减少约 30-40% 的图标相关代码
- 统一图标的使用方式和命名规范
- 优化引入路径，使用 @ 别名

## Impact
- **Affected specs**: UI Components
- **Affected code**:
  - pages/RoomPage.tsx, pages/HomePage.tsx, pages/EntryPage.tsx
  - components/ 目录下的所有包含 SVG 的组件
  - 约 27 个文件需要修改

## Implementation Notes
- 按照"页面-组件-文件"的顺序逐层替换
- 每个文件修改前先清理死代码
- 需要保持图标的语义和样式一致
- 统计代码减少量