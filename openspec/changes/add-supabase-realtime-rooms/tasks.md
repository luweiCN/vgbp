## 1. 环境设置和依赖
- [x] 1.1 在 Supabase 创建新项目
- [x] 1.2 配置数据库表结构（users, rooms, room_participants, bp_states）
- [x] 1.3 设置 Row Level Security (RLS) 策略
- [x] 1.4 安装 @supabase/supabase-js 依赖
- [x] 1.5 配置环境变量（VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY）
- [x] 1.6 更新 vite.config.ts 支持新的环境变量

## 2. 用户认证系统
- [x] 2.1 创建 Supabase 客户端服务 (services/supabase.ts)
- [x] 2.2 实现用户注册功能组件 (AuthForm.tsx)
- [x] 2.3 实现用户登录功能组件 (集成在 AuthForm)
- [x] 2.4 创建用户认证状态管理 Hook (useAuth.ts)
- [x] 2.5 实现会话持久化 (在 useAuth 中)
- [x] 2.6 添加用户登出功能 (在 useAuth 中)
- [x] 2.7 创建匿名用户访问逻辑 (保持本地模式可用)

## 3. 房间管理功能
- [x] 3.1 设计和创建数据库表结构 (supabase-schema.sql)
- [x] 3.2 实现房间创建 Hook (useRooms.ts)
- [x] 3.3 实现房间列表展示组件 (RoomManager.tsx)
- [x] 3.4 实现通过房间 ID 加入功能 (RoomJoin.tsx)
- [x] 3.5 实现房间邀请链接生成和分享
- [x] 3.6 创建房间管理界面（房主专用）
- [x] 3.7 实现参与者管理功能
- [ ] 3.8 添加房间删除功能
- [ ] 3.9 实现所有权转移功能

## 4. 实时同步功能
- [x] 4.1 配置 Supabase Realtime 订阅
- [x] 4.2 实现 BP 状态实时同步 Hook (useBPState.ts)
- [x] 4.3 创建实时状态更新组件 (RealtimeStatus.tsx)
- [x] 4.4 实现冲突检测和解决机制
- [x] 4.5 添加同步状态指示器 (RealtimeStatus.tsx)
- [x] 4.6 实现离线状态检测和处理 (轮询降级)
- [x] 4.7 创建重连机制和数据同步

## 5. 权限控制系统
- [x] 5.1 实现基于角色的权限检查 (usePermissions.tsx)
- [x] 5.2 创建权限 UI 指示器 (PermissionIndicator.tsx)
- [x] 5.3 实现房主编辑权限验证 (useBPState.ts)
- [x] 5.4 实现参与者只读访问控制 (HeroCard.tsx)
- [x] 5.5 添加权限相关的 UI 状态管理

## 6. 双模式架构和兼容性
- [x] 6.1 设计本地模式和在线模式的应用架构
- [x] 6.2 创建模式切换界面和状态管理 (ModeToggle.tsx)
- [x] 6.3 确保本地模式完全独立工作（离线）
- [x] 6.4 保留所有现有本地功能不变
- [ ] 6.5 创建本地数据到云端的迁移工具
- [ ] 6.6 实现本地和云端数据同步选项
- [ ] 6.7 添加数据导入导出功能
- [ ] 6.8 创建数据格式验证逻辑

## 7. UI/UX 更新
- [x] 7.1 重新设计应用主导航结构 (统一显示所有功能按钮)
- [x] 7.2 创建用户认证界面 (AuthForm.tsx)
- [x] 7.3 设计房间管理界面 (RoomManager.tsx)
- [x] 7.4 优化头部按钮布局和状态管理 (App.tsx)
  - [x] 7.4.1 未登录状态：显示「注册登录」「本地模式」「加入房间」按钮
  - [x] 7.4.2 已登录状态：显示「创建房间」「本地模式」「加入房间」「用户信息」「登出」
  - [x] 7.4.3 移除模式切换开关，改为直接按钮功能
- [x] 7.5 更新 BP 界面支持权限控制 (HeroCard.tsx)
- [x] 7.6 添加实时状态指示器 (RealtimeStatus.tsx)
- [x] 7.7 创建房间邀请和分享界面
- [x] 7.8 优化移动端响应式设计

## 8. 错误处理和测试
- [x] 8.1 实现全局错误处理 (useToast.ts)
- [x] 8.2 添加网络错误处理 (App.tsx)
- [x] 8.3 创建加载状态管理 (useBPState.ts)
- [x] 8.4 实现用户友好的错误提示 (Toast.tsx)
- [ ] 8.5 添加单元测试（如配置了测试框架）
- [x] 8.6 进行手动测试和集成测试

## 9. 性能优化
- [x] 9.1 优化实时订阅性能 (services/realtime.ts)
- [x] 9.2 实现数据缓存策略 (useBPState.ts)
- [x] 9.3 优化大房间同步性能 (轮询降级)
- [ ] 9.4 添加连接池管理
- [x] 9.5 实现增量同步机制

## 10. 部署和文档
- [x] 10.1 更新部署配置 (vite.config.ts)
- [x] 10.2 创建用户使用文档 (docs/)
- [x] 10.3 更新开发者文档 (CLAUDE.md)
- [x] 10.4 添加 Supabase 配置说明 (SupabaseConfigGuide.tsx)
- [x] 10.5 创建故障排除指南 (RealtimeDiagnostic.tsx)