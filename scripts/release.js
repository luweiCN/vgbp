#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 检测是否在 CI 环境中运行
const isCI = process.env.CI || process.env.GITHUB_ACTIONS;

console.log('🚀 开始发布流程...\n');

try {
  // 1. 更新版本号
  console.log('1️⃣ 更新版本号...');
  execSync(`node ${path.join(__dirname, 'update-version.js')}`, { stdio: 'inherit' });

  // 2. 更新 PWA manifest 和图标（版本文件将在构建时生成）
  console.log('\n2️⃣ 更新 PWA manifest...');
  execSync(`node ${path.join(__dirname, 'build-version-info.mjs')}`, { stdio: 'inherit' });

  // 3. 生成发布文案
  console.log('\n3️⃣ 生成发布文案...');
  execSync(`node ${path.join(__dirname, 'generate-release-notes.mjs')}`, { stdio: 'inherit' });

  // 4. 如果不是 CI 环境，运行构建测试
  if (!isCI) {
    console.log('\n4️⃣ 本地构建测试...');
    execSync('npm run build:vercel', { stdio: 'inherit' });
  }

  
  // 读取新版本号和发布文案
  const packageJson = JSON.parse(execSync('cat package.json', { encoding: 'utf8' }));
  const newVersion = packageJson.version;
  const releaseNotes = fs.readFileSync('RELEASE_NOTES.md', 'utf8');

  console.log('\n✅ 发布准备完成！');
  console.log(`📦 新版本: v${newVersion}`);
  console.log('\n📝 发布文案预览:');
  console.log('─'.repeat(50));
  console.log(releaseNotes.substring(0, 500) + '...');
  console.log('─'.repeat(50));

  if (!isCI) {
    console.log('\n📋 下一步操作：');
    console.log('   git add .');
    console.log(`   git commit -m "release: v${newVersion}"`);
    console.log('   git push origin main');
    console.log('\n💡 提示: 完整的发布文案已保存在 RELEASE_NOTES.md');
  } else {
    // 在 CI 环境中，输出发布摘要
    const summary = fs.readFileSync('RELEASE_SUMMARY.md', 'utf8');
    console.log('\n::group::📊 发布摘要');
    console.log(summary);
    console.log('::endgroup::');

    // 设置 GitHub Actions 输出
    console.log(`\n::set-output name=version::${newVersion}`);
    console.log(`::set-output name=release_notes::${releaseNotes.substring(0, 1000)}...`);
  }

} catch (error) {
  console.error('\n❌ 发布失败:', error.message);
  process.exit(1);
}