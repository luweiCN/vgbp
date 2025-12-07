#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取版本信息
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// 创建统一的版本信息对象
const versionInfo = {
  version,
  buildTime: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development',
  gitCommit: process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : 'unknown'
};

// 1. 写入到 src 目录（Vite 会在构建时处理）
const srcDir = path.join(__dirname, '../src');
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
}
fs.writeFileSync(
  path.join(srcDir, 'version.generated.json'),
  JSON.stringify(versionInfo, null, 2)
);

// 2. 写入到 public 目录（作为 API 端点）
fs.writeFileSync(
  path.join(__dirname, '../public/version.json'),
  JSON.stringify(versionInfo, null, 2)
);

// 3. 更新 PWA manifest
const manifestPath = path.join(__dirname, '../public/site.webmanifest');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// 更新 manifest 版本和时间戳
const updatedManifest = {
  ...manifest,
  version,
  last_updated: versionInfo.buildTime,
  // 添加构建信息到 manifest
  build_info: {
    environment: versionInfo.environment,
    commit: versionInfo.gitCommit
  }
};

fs.writeFileSync(manifestPath, JSON.stringify(updatedManifest, null, 2));

console.log(`✅ Version info generated: v${version}`);
console.log(`📦 Environment: ${versionInfo.environment}`);
console.log(`🔧 Git commit: ${versionInfo.gitCommit}`);
console.log(`📄 Created version files:`);
console.log(`   - src/version.generated.json (for build)`);
console.log(`   - public/version.json (for runtime)`);
console.log(`   - public/site.webmanifest (for PWA)`);