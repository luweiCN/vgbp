-- 启用 Realtime 功能的 SQL 脚本
-- 在 Supabase Dashboard 的 SQL Editor 中运行这些命令

-- 1. 首先检查 Realtime 是否已启用
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'realtime';

-- 2. 为需要的表启用 Realtime 复制
-- 这些命令会为指定表启用 PostgreSQL 的逻辑复制功能

-- 为 bp_states 表启用实时复制
ALTER PUBLICATION supabase_realtime ADD TABLE public.bp_states;

-- 为 rooms 表启用实时复制
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;

-- 为 room_participants 表启用实时复制
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;

-- 为 users 表启用实时复制（如果需要）
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- 3. 验证复制设置
SELECT
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('bp_states', 'rooms', 'room_participants', 'users');

-- 4. 检查发布（Publication）配置
SELECT
  pubname,
  pubowner,
  puballtables,
  pubinsert,
  pubupdate,
  pubdelete
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- 5. 检查哪些表在发布中
SELECT
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';

-- 6. 如果上面的命令出错，可能需要先创建发布
-- CREATE PUBLICATION supabase_realtime FOR ALL TABLES;