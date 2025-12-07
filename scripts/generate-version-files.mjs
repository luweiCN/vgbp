#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 获取当前 git commit hash
const getCurrentGitCommit = () => {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 7);
  } catch (error) {
    return 'unknown';
  }
};

// 获取环境参数
const getEnvironment = () => {
  // 从命令行参数获取环境
  const args = process.argv.slice(2);
  const modeIndex = args.indexOf('--mode');

  if (modeIndex !== -1 && args[modeIndex + 1]) {
    const mode = args[modeIndex + 1];
    return mode;
  }

  // 从环境变量获取
  if (process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  }

  // 默认根据脚本名判断
  const npmScript = process.env.npm_config_script || process.env.npm_lifecycle_event;
  if (npmScript && npmScript.includes('build')) {
    return 'production';
  }

  return 'development';
};

// 读取版本信息
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// 创建统一的版本信息对象
const versionInfo = {
  version,
  buildTime: new Date().toISOString(),
  environment: getEnvironment(),
  gitCommit: getCurrentGitCommit()
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

// 3. 更新 PWA manifest 图标版本号
const manifestPath = path.join(__dirname, '../public/site.webmanifest');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // 更新图标引用，添加版本参数
  const updatedManifest = {
    ...manifest,
    icons: manifest.icons.map(icon => ({
      ...icon,
      src: icon.src.includes('?')
        ? icon.src.replace(/\?v=[\d.]+/, `?v=${version}`)
        : `${icon.src}?v=${version}`
    }))
  };

  fs.writeFileSync(manifestPath, JSON.stringify(updatedManifest, null, 2));
}

console.log(`✅ Version files generated: v${version}`);
console.log(`📦 Environment: ${versionInfo.environment}`);
console.log(`🔧 Git commit: ${versionInfo.gitCommit}`);
console.log(`📄 Created files:`);
console.log(`   - src/version.generated.json (for build)`);
console.log(`   - public/version.json (for runtime)`);
console.log(`🖼️ PWA icons updated with cache-busting parameters`);