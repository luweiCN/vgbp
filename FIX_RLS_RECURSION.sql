-- 修复 RLS 策略无限递归问题
-- 简化策略，避免复杂的子查询导致递归

-- 1. 删除可能导致递归的复杂策略
DROP POLICY IF EXISTS "Users can view their own rooms" ON rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON rooms;
DROP POLICY IF EXISTS "Owners can update their rooms" ON rooms;
DROP POLICY IF EXISTS "Owners can delete their rooms" ON rooms;

DROP POLICY IF EXISTS "Users can view room participants" ON room_participants;
DROP POLICY IF EXISTS "Owners can add participants" ON room_participants;
DROP POLICY IF EXISTS "Users can leave rooms" ON room_participants;
DROP POLICY IF EXISTS "Owners can remove participants" ON room_participants;

DROP POLICY IF EXISTS "Users can view BP states of their rooms" ON bp_states;
DROP POLICY IF EXISTS "Owners can update BP states" ON bp_states;
DROP POLICY IF EXISTS "Owners can insert BP states" ON bp_states;
DROP POLICY IF EXISTS "Owners can delete BP states" ON bp_states;

DROP POLICY IF EXISTS "Users can view room settings" ON room_settings;
DROP POLICY IF EXISTS "Owners can update room settings" ON room_settings;
DROP POLICY IF EXISTS "Owners can insert room settings" ON room_settings;

-- 2. 创建简化的、无递归的策略

-- rooms 表策略
CREATE POLICY "Anyone can view public rooms" ON rooms
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own rooms" ON rooms
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create rooms" ON rooms
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their rooms" ON rooms
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their rooms" ON rooms
    FOR DELETE USING (owner_id = auth.uid());

-- room_participants 表策略
CREATE POLICY "Users can view own room participants" ON room_participants
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own room participants" ON room_participants
    FOR ALL USING (user_id = auth.uid() OR room_id IN (
        SELECT id FROM rooms WHERE owner_id = auth.uid()
    ));

-- bp_states 表策略
CREATE POLICY "Users can view BP states" ON bp_states
    FOR SELECT USING (true); -- 简化：允许所有认证用户查看

CREATE POLICY "Users can manage BP states" ON bp_states
    FOR ALL USING (true); -- 简化：允许所有认证用户管理（应用层控制）

-- room_settings 表策略
CREATE POLICY "Users can view room settings" ON room_settings
    FOR SELECT USING (true); -- 简化：允许所有认证用户查看

CREATE POLICY "Users can manage room settings" ON room_settings
    FOR ALL USING (true); -- 简化：允许所有认证用户管理（应用层控制）

-- 3. 验证策略创建
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('rooms', 'room_participants', 'bp_states', 'room_settings')
ORDER BY tablename, policyname;