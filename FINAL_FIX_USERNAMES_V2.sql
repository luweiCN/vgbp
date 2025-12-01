-- 终极修复脚本 V2：恢复工作状态并修复用户名问题
-- 处理已存在触发器的问题

-- 1. 删除可能存在的触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. 删除所有现有表和策略
DROP POLICY IF EXISTS "Anyone can view public rooms" ON rooms;
DROP POLICY IF EXISTS "Users can view their own rooms" ON rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON rooms;
DROP POLICY IF EXISTS "Owners can update their rooms" ON rooms;
DROP POLICY IF EXISTS "Owners can delete their rooms" ON rooms;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

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

DROP TABLE IF EXISTS room_settings CASCADE;
DROP TABLE IF EXISTS bp_states CASCADE;
DROP TABLE IF EXISTS room_participants CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. 重新创建原始表结构（确保 username 字段正确工作）

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表（确保能正确处理用户名）
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 房间表
CREATE TABLE rooms (
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
CREATE TABLE room_participants (
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'participant' CHECK (role IN ('owner', 'participant')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- BP 状态表
CREATE TABLE bp_states (
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

-- 房间设置快照表
CREATE TABLE room_settings (
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

-- 4. 创建索引
CREATE INDEX idx_rooms_owner_id ON rooms(owner_id);
CREATE INDEX idx_rooms_created_at ON rooms(created_at);
CREATE INDEX idx_rooms_is_public ON rooms(is_public);
CREATE INDEX idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX idx_bp_states_room_id ON bp_states(room_id);
CREATE INDEX idx_bp_states_hero_id ON bp_states(hero_id);
CREATE INDEX idx_bp_states_is_selected ON bp_states(is_selected);

-- 5. 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. 创建触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bp_states_updated_at BEFORE UPDATE ON bp_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_settings_updated_at BEFORE UPDATE ON room_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. 创建用户资料自动创建触发器（修复版本 - 支持用户名参数）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 从 raw_user_meta_data 获取用户名（如果有的话）
  INSERT INTO public.profiles (id, email, username, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'display_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bp_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_settings ENABLE ROW LEVEL SECURITY;

-- 9. 创建原始的 RLS 策略
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view public rooms" ON rooms
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own rooms" ON rooms
    FOR SELECT USING (
        owner_id = auth.uid() OR
        id IN (
            SELECT room_id FROM room_participants
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create rooms" ON rooms
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their rooms" ON rooms
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their rooms" ON rooms
    FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY "Users can view room participants" ON room_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        room_id IN (
            SELECT id FROM rooms
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can add participants" ON room_participants
    FOR INSERT WITH CHECK (
        room_id IN (
            SELECT id FROM rooms WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can leave rooms" ON room_participants
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Owners can remove participants" ON room_participants
    FOR DELETE USING (
        room_id IN (
            SELECT id FROM rooms WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can view BP states of their rooms" ON bp_states
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM room_participants
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update BP states" ON bp_states
    FOR ALL USING (
        room_id IN (
            SELECT id FROM rooms WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can insert BP states" ON bp_states
    FOR INSERT WITH CHECK (
        room_id IN (
            SELECT id FROM rooms WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete BP states" ON bp_states
    FOR DELETE USING (
        room_id IN (
            SELECT id FROM rooms WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can view room settings" ON room_settings
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM room_participants
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update room settings" ON room_settings
    FOR UPDATE USING (
        room_id IN (
            SELECT id FROM rooms WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can insert room settings" ON room_settings
    FOR INSERT WITH CHECK (
        room_id IN (
            SELECT id FROM rooms WHERE owner_id = auth.uid()
        )
    );

-- 10. 为已存在的用户创建 profiles 记录
INSERT INTO profiles (id, email, username, display_name)
SELECT
    id,
    email,
    COALESCE(
        raw_user_meta_data->>'username',
        split_part(email, '@', 1),
        'user_' || substr(id::text, 1, 8)
    ),
    raw_user_meta_data->>'display_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- 11. 验证表创建成功
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'rooms', 'room_participants', 'bp_states', 'room_settings')
ORDER BY table_name;

-- 12. 验证用户数据
SELECT
    COUNT(*) as total_auth_users,
    (SELECT COUNT(*) FROM profiles) as total_profiles,
    (SELECT COUNT(*) FROM profiles WHERE username IS NOT NULL) as profiles_with_username
FROM auth.users;