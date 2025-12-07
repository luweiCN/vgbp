#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取版本信息
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;

// 获取自上次发布以来的提交
const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""', { encoding: 'utf8' }).trim();
const commits = execSync(
  `git log ${lastTag ? `${lastTag}..HEAD` : 'HEAD'} --oneline --no-merges`,
  { encoding: 'utf8' }
)
  .split('\n')
  .filter(line => line.trim())
  .slice(0, 20); // 最多显示20条提交

// 分析提交类型
const changes = {
  feat: [],
  fix: [],
  refactor: [],
  chore: [],
  docs: [],
  other: []
};

commits.forEach(commit => {
  const match = commit.match(/^[a-f0-9]+\s+(.*?):\s*(.*)/);
  if (match) {
    const [, type, desc] = match;
    if (changes[type]) {
      changes[type].push(desc);
    } else {
      changes.other.push(`${type}: ${desc}`);
    }
  } else {
    changes.other.push(commit);
  }
});

// 生成发布文案
function generateReleaseNotes() {
  const sections = [];

  // 标题
  sections.push(`# Release v${version}\n`);

  // 日期
  sections.push(`*发布时间: ${new Date().toLocaleString('zh-CN')}*\n`);

  // 主要功能
  if (changes.feat.length > 0) {
    sections.push('## ✨ 新功能\n');
    changes.feat.forEach(feat => {
      sections.push(`- ${feat}`);
    });
    sections.push('');
  }

  // 修复
  if (changes.fix.length > 0) {
    sections.push('## 🐛 问题修复\n');
    changes.fix.forEach(fix => {
      sections.push(`- ${fix}`);
    });
    sections.push('');
  }

  // 改进
  if (changes.refactor.length > 0) {
    sections.push('## 🔄 改进优化\n');
    changes.refactor.forEach(refactor => {
      sections.push(`- ${refactor}`);
    });
    sections.push('');
  }

  // 构建和工具
  if (changes.chore.length > 0) {
    sections.push('## 🔧 构建和工具\n');
    changes.chore.forEach(chore => {
      sections.push(`- ${chore}`);
    });
    sections.push('');
  }

  // 其他
  if (changes.other.length > 0) {
    sections.push('## 📝 其他更改\n');
    changes.other.slice(0, 10).forEach(other => {
      sections.push(`- ${other}`);
    });
    if (changes.other.length > 10) {
      sections.push(`- ...还有 ${changes.other.length - 10} 条提交`);
    }
    sections.push('');
  }

  // 统计
  const totalCommits = commits.length;
  const contributors = new Set();
  commits.forEach(commit => {
    const author = execSync(`git log -1 --format="%an" "${commit.split(' ')[0]}"`, { encoding: 'utf8' }).trim();
    contributors.add(author);
  });

  sections.push('---\n');
  sections.push(`📊 本版本包含 **${totalCommits}** 次提交`);
  sections.push(`👥 贡献者: ${Array.from(contributors).join(', ')}`);
  sections.push(`🚀 部署环境已更新`);

  return sections.join('\n');
}

// 生成 GitHub Actions 使用的摘要
function generateSummary() {
  const summary = [];
  summary.push(`## 🚀 发布 v${version}`);

  if (changes.feat.length > 0) {
    summary.push(`\n✨ **${changes.feat.length} 个新功能**`);
  }
  if (changes.fix.length > 0) {
    summary.push(`\n🐛 **${changes.fix.length} 个问题修复**`);
  }

  summary.push(`\n📦 **总计 ${commits.length} 次提交**`);

  return summary.join('');
}

// 输出结果
const releaseNotes = generateReleaseNotes();
const summary = generateSummary();

// 保存到文件
fs.writeFileSync('RELEASE_NOTES.md', releaseNotes, 'utf8');
fs.writeFileSync('RELEASE_SUMMARY.md', summary, 'utf8');

console.log('✅ Release notes generated!\n');
console.log('📄 RELEASE_NOTES.md - 详细发布说明');
console.log('📄 RELEASE_SUMMARY.md - GitHub Actions 摘要\n');
console.log(releaseNotes);