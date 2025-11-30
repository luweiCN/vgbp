-- Row Level Security (RLS) 策略
-- 在 supabase-schema.sql 执行之后运行这些语句

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bp_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_settings ENABLE ROW LEVEL SECURITY;

-- Profiles 表的 RLS 策略
-- 用户只能查看和更新自己的资料
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Rooms 表的 RLS 策略
-- 所有人都可以查看公开房间
CREATE POLICY "Anyone can view public rooms" ON rooms
    FOR SELECT USING (is_public = true);

-- 用户只能查看自己参与的房间
CREATE POLICY "Users can view their own rooms" ON rooms
    FOR SELECT USING (
        owner_id = auth.uid() OR
        id IN (
            SELECT room_id FROM room_participants
            WHERE user_id = auth.uid()
        )
    );

-- 用户只能创建自己拥有的房间
CREATE POLICY "Users can create rooms" ON rooms
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- 只有房主可以更新房间信息
CREATE POLICY "Owners can update their rooms" ON rooms
    FOR UPDATE USING (owner_id = auth.uid());

-- 只有房主可以删除房间
CREATE POLICY "Owners can delete their rooms" ON rooms
    FOR DELETE USING (owner_id = auth.uid());

-- Room_participants 表的 RLS 策略
-- 用户可以查看自己参与的房间参与者
CREATE POLICY "Users can view room participants" ON room_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        room_id IN (
            SELECT id FROM rooms
            WHERE owner_id = auth.uid()
        )
    );

-- 房主可以添加参与者
CREATE POLICY "Owners can add participants" ON room_participants
    FOR INSERT WITH CHECK (
        room_id IN (
            SELECT id FROM rooms WHERE owner_id = auth.uid()
        )
    );

-- 用户可以移除自己参与的房间
CREATE POLICY "Users can leave rooms" ON room_participants
    FOR DELETE USING (user_id = auth.uid());

-- 房主可以移除参与者
CREATE POLICY "Owners can remove participants" ON room_participants
    FOR DELETE USING (
        room_id IN (
            SELECT id FROM rooms WHERE owner_id = auth.uid()
        )
    );

-- BP_states 表的 RLS 策略
-- 用户可以查看自己参与房间的 BP 状态
CREATE POLICY "Users can view BP states of their rooms" ON bp_states
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM room_participants
            WHERE user_id = auth.uid()
        )
    );

-- 房主可以更新 BP 状态
CREATE POLICY "Owners can update BP states" ON bp_states
    FOR ALL USING (
        room_id IN (
            SELECT id FROM rooms WHERE owner_id = auth.uid()
        )
    );

-- 房主可以插入 BP 状态
CREATE POLICY "Owners can insert BP states" ON bp_states
    FOR INSERT WITH CHECK (
        room_id IN (
            SELECT id FROM rooms WHERE owner_id = auth.uid()
        )
    );

-- 房主可以删除 BP 状态
CREATE POLICY "Owners can delete BP states" ON bp_states
    FOR DELETE USING (
        room_id IN (
            SELECT id FROM rooms WHERE owner_id = auth.uid()
        )
    );

-- Room_settings 表的 RLS 策略
-- 用户可以查看自己参与房间的设置
CREATE POLICY "Users can view room settings" ON room_settings
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM room_participants
            WHERE user_id = auth.uid()
        )
    );

-- 房主可以更新房间设置
CREATE POLICY "Owners can update room settings" ON room_settings
    FOR UPDATE USING (
        room_id IN (
            SELECT id FROM rooms WHERE owner_id = auth.uid()
        )
    );

-- 房主可以插入房间设置
CREATE POLICY "Owners can insert room settings" ON room_settings
    FOR INSERT WITH CHECK (
        room_id IN (
            SELECT id FROM rooms WHERE owner_id = auth.uid()
        )
    );