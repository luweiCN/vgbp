#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取版本号作为缓存破坏参数
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// 目标 manifest 文件
const manifestPath = path.join(__dirname, '../public/site.webmanifest');

// 读取 manifest
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// 为图标添加版本参数
const updatedManifest = {
  ...manifest,
  icons: manifest.icons.map(icon => ({
    ...icon,
    src: icon.src.includes('?')
      ? icon.src.replace(/\?v=\d+/, `?v=${version}`)
      : `${icon.src}?v=${version}`
  })),
  version,
  last_updated: new Date().toISOString()
};

// 写回文件
fs.writeFileSync(manifestPath, JSON.stringify(updatedManifest, null, 2));

console.log(`✅ PWA icons updated with version ${version}`);
console.log('📦 Icons now have cache-busting parameters');