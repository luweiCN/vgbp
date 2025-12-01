-- 修复 rooms 表的 RLS 策略
-- 专门解决创建房间时的权限问题

-- 1. 查看当前策略
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'rooms';

-- 2. 删除现有策略
DROP POLICY IF EXISTS "Anyone can view public rooms" ON rooms;
DROP POLICY IF EXISTS "Users can manage own rooms" ON rooms;

-- 3. 创建正确的策略
-- 允许已认证用户查看公开房间
CREATE POLICY "Anyone can view public rooms" ON rooms
FOR SELECT
USING (is_public = true);

-- 允许已认证用户创建房间（这个是关键的）
CREATE POLICY "Authenticated users can create rooms" ON rooms
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- 允许用户管理自己的房间
CREATE POLICY "Users can manage own rooms" ON rooms
FOR ALL
USING (owner_id = auth.uid() OR (is_public = true AND cmd = 'SELECT'))
WITH CHECK (owner_id = auth.uid());

-- 4. 验证策略创建
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'rooms'
ORDER BY policyname;