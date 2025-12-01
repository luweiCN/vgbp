-- 复制这些SQL到 Supabase Dashboard > SQL Editor 中执行

-- 为 rooms 表添加 RLS 策略
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

-- 为 room_participants 表添加 RLS 策略
CREATE POLICY "Users can manage room participants" ON room_participants
FOR ALL
USING (
  room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid()) OR
  user_id = auth.uid()
);

-- 为 room_settings 表添加 RLS 策略
CREATE POLICY "Users can manage room settings" ON room_settings
FOR ALL
USING (
  room_id IN (SELECT id FROM rooms WHERE owner_id = auth.uid())
);

-- 验证策略是否创建成功
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('rooms', 'room_participants', 'room_settings');