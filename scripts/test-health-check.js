#!/usr/bin/env node

/**
 * 本地测试脚本 - 验证健康检查逻辑
 * 运行: node scripts/test-health-check.js
 */

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function healthCheck() {
  console.log('🔍 开始本地 Supabase 健康检查...');
  console.log('📡 检查 URL:', SUPABASE_URL);

  // 检查环境变量
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ 缺少必要的环境变量');
    console.log('请确保 .env.local 文件包含:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    process.exit(1);
  }

  try {
    // 检查 API 连接
    console.log('📡 检查 Supabase API 连接...');
    const apiResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });

    if (apiResponse.ok) {
      console.log('✅ Supabase API 连接正常');
    } else {
      console.error(`❌ API 连接失败: ${apiResponse.status} ${apiResponse.statusText}`);
      process.exit(1);
    }

    // 检查数据库连接
    console.log('📊 检查数据库连接...');
    const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/rooms?select=1&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    });

    if (dbResponse.ok || dbResponse.status === 406) {
      console.log('✅ 数据库连接正常');
    } else {
      console.error(`❌ 数据库连接失败: ${dbResponse.status} ${dbResponse.statusText}`);
      process.exit(1);
    }

    // 检查 Edge Functions
    console.log('🔥 检查 Edge Functions...');
    const edgeResponse = await fetch(`${SUPABASE_URL}/functions/v1/check-email`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'test@example.com' })
    });

    if (edgeResponse.status === 404 || edgeResponse.status === 200) {
      console.log('✅ Edge Functions 服务正常');
    } else {
      console.log(`⚠️ Edge Functions 可能未部署: ${edgeResponse.status}`);
    }

    console.log('🎉 本地健康检查完成！');
    console.log('📅 检查时间:', new Date().toISOString());

  } catch (error) {
    console.error('❌ 健康检查过程中出错:', error.message);
    process.exit(1);
  }
}

// 运行健康检查
healthCheck();