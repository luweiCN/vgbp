-- 简化的 RLS 修复，只包含确实存在的表
-- 复制到 Supabase Dashboard > SQL Editor 中执行

-- 1. 为 rooms 表创建 RLS 策略
CREATE POLICY "Users can insert their own rooms" ON rooms
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view public rooms" ON rooms
FOR SELECT
USING (is_public = true OR owner_id = auth.uid());

CREATE POLICY "Users can update their own rooms" ON rooms
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own rooms" ON rooms
FOR DELETE
USING (auth.uid() = owner_id);

-- 2. 为 room_participants 表创建 RLS 策略
CREATE POLICY "Users can manage room participants" ON room_participants
FOR ALL
USING (
  room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid()) OR
  user_id = auth.uid()
);

-- 3. 检查表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('rooms', 'room_participants', 'room_settings');

-- 4. 查看当前的 RLS 策略
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('rooms', 'room_participants')
ORDER BY tablename, policyname;