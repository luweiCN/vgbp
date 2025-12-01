-- 最简单的测试 - 检查是否能直接创建房间
-- 手动测试房间创建

-- 1. 检查当前用户
SELECT current_user, auth.uid(), auth.role();

-- 2. 检查表的 RLS 状态
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'rooms';

-- 3. 检查 rooms 表上是否还有策略
SELECT * FROM pg_policies WHERE tablename = 'rooms';

-- 4. 手动测试插入（模拟应用层操作）
-- 注意：你需要先用 actual user ID 替换下面的测试 ID
SELECT 'Testing direct insert...';
SELECT auth.uid() as user_id;

-- 如果你有用户 ID，可以取消注释下面这行进行测试
-- INSERT INTO rooms (name, owner_id, is_public)
-- VALUES ('test room', auth.uid(), true);

SELECT 'If you see this, the script executed successfully';