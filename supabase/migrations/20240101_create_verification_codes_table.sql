-- 创建验证码表
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  used BOOLEAN DEFAULT FALSE
);

-- 创建索引以提高查询性能
CREATE INDEX idx_verification_codes_email ON verification_codes(email);
CREATE INDEX idx_verification_codes_expires_at ON verification_codes(expires_at);
CREATE INDEX idx_verification_codes_code_email ON verification_codes(code, email);

-- 创建RLS（行级安全策略）
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户插入验证码（用于注册流程）
CREATE POLICY "Allow anonymous insert" ON verification_codes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 允许匿名用户查询验证码（用于验证）
CREATE POLICY "Allow anonymous select" ON verification_codes
  FOR SELECT
  TO anon
  USING (true);

-- 允许匿名用户更新验证码（用于增加尝试次数）
CREATE POLICY "Allow anonymous update" ON verification_codes
  FOR UPDATE
  TO anon
  WITH CHECK (true);

-- 允许匿名用户删除验证码（用于清理）
CREATE POLICY "Allow anonymous delete" ON verification_codes
  FOR DELETE
  TO anon
  USING (true);

-- 创建清理过期验证码的函数
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM verification_codes
  WHERE expires_at < NOW();
END;
$$;

-- 创建定时任务清理过期验证码（需要Supabase支持cron jobs）
-- 注意：这个需要在Supabase Dashboard中手动设置
-- 或者通过应用层定期调用