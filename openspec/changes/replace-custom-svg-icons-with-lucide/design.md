# Design: SVG 图标替换为 Lucide 图标

## Context

项目当前使用 27 个文件中的内联 SVG 图标，代码量大且维护困难。已引入 Lucide React 作为图标库（v0.555.0），目前仅使用了 Globe 图标。

## Goals / Non-Goals

- **Goals**:
  - 减少代码量 30-40%
  - 统一图标风格和交互
  - 提高代码可维护性
  - 优化性能
- **Non-Goals**:
  - 改变图标的视觉设计（保持一致）
  - 添加新的图标功能
  - 修改图标的行为逻辑

## Decisions

1. **图标映射策略**:
   - 创建 SVG 到 Lucide 图标的映射表
   - 优先选择语义最接近的图标
   - 对不匹配的图标考虑组合使用

2. **引入方式**:
   - 统一使用 `@/` 别名引入
   - 按需引入，避免全量导入

3. **样式保持**:
   - 使用 `className` 而非内联样式
   - 保持现有的 `size`、`strokeWidth` 等属性

## Risks / Trade-offs

- **Risk**: Lucide 图标可能与自定义 SVG 略有差异
  - **Mitigation**: 逐个验证，必要时调整样式
- **Trade-off**: 失去完全自定义的能力
  - **Justification**: Lucide 提供足够的定制选项

## Migration Plan

1. 分析每个 SVG 的语义
2. 查找对应的 Lucide 图标
3. 替换并调整样式
4. 验证功能和视觉效果

## Open Questions

- 是否需要创建自定义图标组件来封装常用样式？

  > 需要, 以便统一管理样式和属性

- 如何处理 Lucide 中不存在的特殊图标？
  > 使用相似语义的图标代替, 并在文档中注明差异

