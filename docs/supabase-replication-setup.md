# Supabase 表复制（Replication）设置指南

## 🎯 问题说明
当Realtime功能出现WebSocket连接失败时，最常见的原因是没有为需要的表启用复制功能。这会阻止实时订阅监听表的变化。

## 📋 详细步骤

### 1. 登录 Supabase Dashboard
- 访问 https://supabase.com/dashboard
- 登录你的账号
- 选择你的项目（hvbqzfdmmoupwvbwegug）

### 2. 进入数据库复制设置
- 在左侧导航栏点击 **Database**
- 在页面下方找到 **Replication** 选项卡
- 或者直接访问：`https://supabase.com/dashboard/project/hvbqzfdmmoupwvbwegug/database/replication`

### 3. 启用表复制
你会看到一个表格列表，包括：
- `bp_states` ⭐ **最重要**
- `rooms`
- `room_participants`
- `users`

#### 为 `bp_states` 表启用复制：
1. 找到 `bp_states` 表
2. 点击右侧的 **Reset** 按钮（如果显示禁用状态）
3. 确认操作
4. 确保状态显示为 "Enabled" 或有绿色的启用指示器

#### 同时启用其他表的复制：
1. `rooms` 表：点击 **Reset** 启用
2. `room_participants` 表：点击 **Reset** 启用
3. `users` 表：点击 **Reset** 启用（如果有）

### 4. 检查 Realtime 功能状态
确保顶部的 **Realtime** 开关是启用的：
- 进入 **Project Settings** > **API**
- 找到 **Realtime** 部分
- 确保开关是打开状态

## 🔍 验证设置是否正确

### 方法1：使用我们的诊断工具
1. 进入你的应用 http://localhost:3000
2. 创建或加入一个房间
3. 在右下角找到"实时功能诊断"面板
4. 点击"运行诊断"
5. 查看结果中的"BP状态表"状态

### 方法2：检查Supabase Dashboard
1. 返回 **Database** > **Replication**
2. 确认 `bp_states` 表状态为启用
3. 检查表名旁边是否有绿色的指示器

## 🛠️ 故障排除

### 如果看不到 Replication 选项卡
1. 确保你有项目的管理员权限
2. 检查项目是否已经完成初始化
3. 尝试刷新页面

### 如果 Reset 按钮不可用
1. 检查表是否存在
2. 确保表有主键
3. 尝试重建表

### 如果仍然无法工作
可能需要配置RLS策略：
```sql
-- 在 SQL Editor 中运行
CREATE POLICY "Enable realtime for anonymous users" ON bp_states
FOR SELECT USING (true);

CREATE POLICY "Enable realtime for anonymous users" ON rooms
FOR SELECT USING (true);
```

## 📸 预期界面截图

你应该看到的界面：
```
┌─────────────────────────────────────┐
│ Replication                          │
├─────────────────────────────────────┤
│ Table Name    │ Status   │ Action   │
├─────────────────────────────────────┤
│ bp_states     │ Enabled  │ Reset    │
│ rooms         │ Enabled  │ Reset    │
│ room_participants │ Enabled │ Reset │
│ users         │ Enabled  │ Reset    │
└─────────────────────────────────────┘
```

## ✅ 设置完成后的效果

设置成功后：
1. WebSocket连接应该能够正常建立
2. 房间中的英雄选择变化会实时同步
3. 诊断工具显示"BP状态表订阅成功"
4. 查看模式的用户能实时看到创建人的操作

## 🚨 注意事项

- 每次修改表结构后，可能需要重新启用复制
- 复制功能会消耗一定的资源，但只对少量表影响很小
- 如果使用RLS，需要配置相应的策略允许实时访问

---

完成这些步骤后，回到你的应用测试实时同步功能应该就能正常工作了！