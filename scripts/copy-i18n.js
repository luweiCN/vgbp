#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 源目录和目标目录
const sourceDir = path.join(__dirname, '../i18n/locales');
const targetDir = path.join(__dirname, '../public/i18n/locales');

// 确保目标目录存在
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 只复制非 fallback 语言文件（中文已内联到代码中）
const locales = ['en-US.json'];
let copied = 0;

locales.forEach(locale => {
  const sourceFile = path.join(sourceDir, locale);
  const targetFile = path.join(targetDir, locale);

  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`✓ 复制 ${locale}`);
    copied++;
  } else {
    console.warn(`⚠️ 源文件不存在: ${sourceFile}`);
  }
});

console.log(`\n复制完成: ${copied}/${locales.length} 个文件`);

// 更新 manifest.json（如果存在）
const manifestPath = path.join(__dirname, '../public/site.webmanifest');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    // 添加时间戳以确保缓存更新
    manifest.last_updated = new Date().toISOString();
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✓ 更新 site.webmanifest 时间戳');
  } catch (err) {
    console.error('❌ 更新 site.webmanifest 失败:', err.message);
  }
}