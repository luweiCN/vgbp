# 任务清单: 使用 Lucide 图标库替换自定义 SVG 图标

## 工作流程指导

### 🚀 标准替换流程

#### 第一阶段：页面级别替换（3个页面）

1. **EntryPage.tsx** (入口页面)
   - [x] 分析页面中的 SVG 图标
   - [x] 清理死代码和未使用的组件
   - [x] 替换本地模式图标 (Home)
   - [x] 替换在线模式图标 (Wifi/Globe)
   - [x] 验证视觉效果

2. **HomePage.tsx** (主页)
   - [x] 分析页面中的 SVG 图标
   - [x] 清理死代码和未使用的组件
   - [x] 替换相关图标
   - [x] 验证视觉效果

3. **RoomPage.tsx** (房间页面)
   - [x] 分析页面中的 SVG 图标
   - [x] 清理死代码和未使用的组件
   - [x] 替换相关图标
   - [x] 验证视觉效果

#### 第二阶段：组件级别替换（按使用频率排序）

4. **核心交互组件**
   - [x] LanguageSelector - 语言切换图标
   - [x] RoomSortToggle - 排序方向图标
   - [x] ClassificationToggle - 分类切换图标
   - [x] FilterHeader - 筛选相关图标
   - [x] RoomSearchBox - 搜索和清除图标

5. **模态框组件**
   - [x] SelectedHeroesModal - 删除图标
   - [x] RoomFormModal - 表单图标
   - [x] ResetConfirmModal - 警告图标
   - [x] AuthModal - 认证相关图标

6. **列表和展示组件**
   - [x] RoomItem - 房间状态图标
   - [x] HeroCard - 英雄相关图标
   - [x] Pagination - 翻页图标
   - [x] PermissionIndicator - 权限图标

7. **其他功能组件**
   - [x] Toast - 通知状态图标
   - [x] LayoutToggle - 布局切换图标
   - [x] OnlineModeIndicator - 连接状态图标
   - [x] UserSettingsModal - 用户设置图标
   - [x] RoomManagerMenuModal - 菜单图标
   - [x] RoomHeader - 页面头部图标
   - [x] EmailStatusModals - 邮箱状态图标
   - [x] SelectedHeroesModal - 选中英雄图标
   - [x] RoomFormModal - 房间表单图标
   - [x] ResetConfirmModal - 重置确认图标
   - [x] AuthModal - 认证模态框图标
   - [x] ClassificationToggle - 分类切换图标
   - [x] FilterHeader - 筛选头部图标

#### 第三阶段：验证和优化

8. **代码质量检查**
   - [x] 更新所有 import 使用 @ 别名
   - [x] 清理未使用的 SVG 相关代码
   - [x] 检查图标一致性
   - [x] 测试所有交互功能

9. **性能和统计**
   - [x] 统计代码减少量
   - [x] 检查 bundle 大小变化
   - [x] 验证图标加载性能
   - [x] 测试响应式表现

## 详细执行指南

### 文件处理步骤
1. **代码分析**
   ```typescript
   // 识别 SVG 使用模式
   <svg className="w-5 h-5" viewBox="0 0 24 24">
     <path d="M..." />
   </svg>
   ```

2. **死代码清理**
   - 查找未使用的函数
   - 删除无用的条件分支
   - 移除空的组件

3. **图标替换**
   ```typescript
   // 替换前
   <svg>...</svg>

   // 替换后
   import { Home } from 'lucide-react';
   <Home className="w-5 h-5" />
   ```

4. **样式保持**
   - 保持 size 类名
   - 保持 color 相关类
   - 调整特殊样式

### 图标映射参考
| SVG 语义 | Lucide 图标 | 备注 |
|---------|------------|------|
| 房子/主页 | Home, House | 本地模式 |
| 网络/云 | Wifi, Cloud | 在线模式 |
| 搜索 | Search | 搜索框 |
| 关闭/删除 | X, Trash | 删除操作 |
| 菜单 | Menu, MoreHorizontal | 下拉菜单 |
| 箭头上 | ChevronUp | 展开/收起 |
| 箭头下 | ChevronDown | 展开/收起 |
| 左箭头 | ChevronLeft | 上一页 |
| 右箭头 | ChevronRight | 下一页 |
| 设置 | Settings | 设置按钮 |
| 用户 | User | 用户相关 |
| 邮件 | Mail | 邮件功能 |
| 勾选 | Check | 已选中 |
| 信息 | Info | 信息提示 |
| 警告 | AlertTriangle | 警告提示 |
| 错误 | XCircle | 错误提示 |
| 成功 | CheckCircle | 成功提示 |

## 验收标准

### 功能完整性
- [x] 所有图标正确显示
- [x] 交互功能正常
- [x] 响应式布局不受影响

### 视觉一致性
- [x] 图标大小一致
- [x] 颜色主题正确
- [x] 对齐方式正确

### 代码质量
- [x] import 使用 @ 别名
- [x] 无死代码
- [x] TypeScript 类型正确

### 性能指标
- [x] 代码量减少 30%+
- [x] Bundle 大小不增加
- [x] 图标加载速度提升

---

**重要提醒**：
- 每修改一个文件都需要确认效果
- 保持与用户确认视觉和语义
- 记录特殊情况和解决方案
- 统计整体优化效果