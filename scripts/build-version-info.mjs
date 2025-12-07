#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取版本信息
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// 更新 PWA manifest
const manifestPath = path.join(__dirname, '../public/site.webmanifest');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// 更新 manifest 版本和时间戳
const updatedManifest = {
  ...manifest,
  version,
  last_updated: new Date().toISOString(),
  // 添加构建信息到 manifest
  build_info: {
    environment: 'production',
    commit: 'production'
  }
};

fs.writeFileSync(manifestPath, JSON.stringify(updatedManifest, null, 2));

console.log(`✅ PWA manifest updated: v${version}`);