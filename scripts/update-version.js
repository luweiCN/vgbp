#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// 读取 package.json
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 解析当前版本号
const currentVersion = packageJson.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);

// 更新补丁版本号
const newVersion = `${major}.${minor}.${patch + 1}`;

// 更新 package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`✅ 版本已更新: ${currentVersion} → ${newVersion}`);
console.log(`📦 package.json 已更新`);