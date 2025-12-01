-- 最简化的 RLS 修复
-- 复制到 Supabase Dashboard > SQL Editor 中执行

-- 只为 rooms 表创建必要的 RLS 策略
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

-- 查看当前的所有表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;