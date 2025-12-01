-- 完整数据库恢复脚本
-- 清空所有表并重新创建原始结构

-- 1. 删除现有表（如果存在）
DROP TABLE IF EXISTS room_settings CASCADE;
DROP TABLE IF EXISTS bp_states CASCADE;
DROP TABLE IF EXISTS room_participants CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. 删除现有触发器和函数
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
DROP TRIGGER IF EXISTS update_bp_states_updated_at ON bp_states;
DROP TRIGGER IF EXISTS update_room_settings_updated_at ON room_settings;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 3. 从原始 schema.sql 重新创建表结构

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表 (基于 Supabase auth.users 表，这里创建一个本地用户配置表)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 房间表
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) > 0 AND char_length(name) <= 50),
  description TEXT CHECK (char_length(description) <= 200),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 房间参与者表
CREATE TABLE IF NOT EXISTS room_participants (
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'participant' CHECK (role IN ('owner', 'participant')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- BP 状态表 (英雄选择状态)
CREATE TABLE IF NOT EXISTS bp_states (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  hero_id TEXT NOT NULL,
  is_selected BOOLEAN DEFAULT false,
  selection_type TEXT DEFAULT 'ban' CHECK (selection_type IN ('ban', 'pick')),
  selected_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, hero_id, selection_type)
);

-- 房间设置快照表 (用于保存搜索过滤、分类模式等设置)
CREATE TABLE IF NOT EXISTS room_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL UNIQUE,
  search_term TEXT DEFAULT '',
  hide_selected BOOLEAN DEFAULT false,
  classification_mode TEXT DEFAULT 'official' CHECK (classification_mode IN ('official', 'common', 'flex')),
  layout_mode TEXT DEFAULT 'auto' CHECK (layout_mode IN ('auto', '3', '4', '5')),
  current_visible_section TEXT CHECK (current_visible_section IN ('captain', 'jungle', 'carry', null)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_rooms_owner_id ON rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at);
CREATE INDEX IF NOT EXISTS idx_rooms_is_public ON rooms(is_public);
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_bp_states_room_id ON bp_states(room_id);
CREATE INDEX IF NOT EXISTS idx_bp_states_hero_id ON bp_states(hero_id);
CREATE INDEX IF NOT EXISTS idx_bp_states_is_selected ON bp_states(is_selected);

-- 5. 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. 创建自动更新时间戳的触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bp_states_updated_at BEFORE UPDATE ON bp_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_settings_updated_at BEFORE UPDATE ON room_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. 创建用户资料自动创建的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. 重新创建 RLS 策略

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bp_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_settings ENABLE ROW LEVEL SECURITY;

-- Profiles 表的 RLS 策略
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

-- 9. 验证表创建成功
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;