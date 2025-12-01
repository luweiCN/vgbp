-- 修复 rooms 表的 RLS 策略
-- 允许已认证用户创建房间
CREATE POLICY "Users can insert their own rooms" ON rooms
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- 允许已认证用户查看所有公开房间
CREATE POLICY "Users can view public rooms" ON rooms
FOR SELECT
USING (is_public = true OR owner_id = auth.uid());

-- 允许房主更新自己的房间
CREATE POLICY "Users can update their own rooms" ON rooms
FOR UPDATE
USING (auth.uid() = owner_id);

-- 允许房主删除自己的房间
CREATE POLICY "Users can delete their own rooms" ON rooms
FOR DELETE
USING (auth.uid() = owner_id);

-- 修复 room_participants 表的 RLS 策略
CREATE POLICY "Users can insert room participants for their rooms" ON room_participants
FOR INSERT
WITH CHECK (
  room_id IN (
    SELECT id FROM rooms WHERE owner_id = auth.uid()
  ) OR user_id = auth.uid()
);

CREATE POLICY "Users can view room participants" ON room_participants
FOR SELECT
USING (
  room_id IN (
    SELECT id FROM rooms WHERE owner_id = auth.uid()
  ) OR user_id = auth.uid()
);

-- 修复 room_settings 表的 RLS 策略
CREATE POLICY "Users can manage room settings for their rooms" ON room_settings
FOR ALL
USING (
  room_id IN (
    SELECT id FROM rooms WHERE owner_id = auth.uid()
  )
);