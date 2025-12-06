#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 检测是否在 CI 环境中运行
const isCI = process.env.CI || process.env.GITHUB_ACTIONS;

console.log('🚀 开始发布流程...\n');

try {
  // 1. 更新版本号
  console.log('1️⃣ 更新版本号...');
  execSync(`node ${path.join(__dirname, 'update-version.js')}`, { stdio: 'inherit' });

  // 2. 如果不是 CI 环境，运行构建测试
  if (!isCI) {
    console.log('\n2️⃣ 本地构建测试...');
    execSync('npm run build:vercel', { stdio: 'inherit' });
  }

  // 读取新版本号
  const packageJson = JSON.parse(execSync('cat package.json', { encoding: 'utf8' }));
  const newVersion = packageJson.version;

  console.log('\n✅ 版本更新完成！');
  console.log(`📦 新版本: v${newVersion}`);

  if (!isCI) {
    console.log('');
    console.log('📋 提交代码到 Git：');
    console.log('   git add .');
    console.log(`   git commit -m "release: v${newVersion}"`);
    console.log('   git push origin main');
    console.log('');
    console.log('🔄 Vercel 会自动：');
    console.log('   - 检测到 main 分支更新');
    console.log('   - 自动构建新版本');
    console.log('   - 你可以在 Vercel 控制台设置为生产版本');
  }

  console.log('\n🔄 PWA 会在下次访问时自动更新');

} catch (error) {
  console.error('\n❌ 发布失败:', error.message);
  process.exit(1);
}