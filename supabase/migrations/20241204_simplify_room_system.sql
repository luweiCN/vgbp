-- 迁移：简化房间系统 - 移除参与者和公开房间概念
-- 这个迁移将显著简化房间架构并提高性能
-- 注意：当前系统未启用 RLS，所以不需要处理策略

-- 步骤1：删除 room_participants 表（级联删除将处理外键约束）
DROP TABLE IF EXISTS room_participants CASCADE;

-- 步骤2：删除 rooms 表中的 is_public 列
ALTER TABLE rooms DROP COLUMN IF EXISTS is_public;

-- 删除不再需要的索引（如果存在的话）
DROP INDEX IF EXISTS idx_rooms_is_public ON rooms(is_public);
DROP INDEX IF EXISTS idx_room_participants_room_id ON room_participants(room_id);
DROP INDEX IF EXISTS idx_room_participants_user_id ON room_participants(user_id);

-- 步骤3：删除 room_settings 表（AI过度设计的遗留代码，实际未被使用）
DROP TABLE IF EXISTS room_settings CASCADE;

-- 说明：room_settings 表设计用于存储 BP 界面设置，但实际代码中从未使用
-- 只在创建房间时插入空记录，完全没有业务价值，可以安全删除