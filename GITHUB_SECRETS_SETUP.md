# GitHub Secrets 配置指南

## 📋 需要配置的环境变量

### 1. Supabase 配置
- `SUPABASE_URL`: 您的 Supabase 项目 URL
- `SUPABASE_ANON_KEY`: 您的 Supabase 匿名密钥

### 2. Google Gemini AI 配置（可选）
- `GEMINI_API_KEY`: Google Gemini API 密钥

## 🔧 在 GitHub 中配置 Secrets

### 步骤 1: 进入 GitHub Secrets 设置
1. 进入您的 GitHub 仓库
2. 点击 `Settings` 标签页
3. 在左侧菜单中点击 `Secrets and variables` > `Actions`

### 步骤 2: 添加 Repository Secrets
点击 `New repository secret` 按钮，逐个添加以下 secrets：

#### Supabase 配置
1. **Name**: `SUPABASE_URL`
   - **Value**: `https://your-project-id.supabase.co`
   - 从您的 Supabase 项目设置中获取 URL

2. **Name**: `SUPABASE_ANON_KEY`
   - **Value**: `your-supabase-anon-key`
   - 从您的 Supabase 项目设置中获取匿名密钥

#### Gemini AI 配置（可选）
3. **Name**: `GEMINI_API_KEY`
   - **Value**: `your-gemini-api-key`
   - 从 Google AI Studio 获取 API 密钥

## 📍 获取 Supabase 配置信息

### 方法 1: 通过 Supabase Dashboard
1. 访问 [supabase.com](https://supabase.com)
2. 选择您的项目
3. 点击 `Settings` 图标（齿轮图标）
4. 在 `API` 部分找到：
   - **Project URL**: 复制这个值作为 `SUPABASE_URL`
   - **anon public**: 复制这个值作为 `SUPABASE_ANON_KEY`

### 方法 2: 通过项目设置
1. 在 Supabase Dashboard 中
2. 点击 `Project Settings`
3. 选择 `API`
4. 复制相应的 URL 和密钥

## 🔒 安全注意事项

### ✅ 推荐做法
- ✅ 使用 Repository Secrets，不要在代码中硬编码
- ✅ 定期轮换 API 密钥
- ✅ 限制密钥的权限范围
- ✅ 启用 GitHub Actions 的依赖审查

### ❌ 避免的做法
- ❌ 不要在代码中提交 `.env` 文件
- ❌ 不要在 commit 中包含敏感信息
- ❌ 不要在公开的 issue 中分享密钥

## 🚀 验证配置

配置完成后，GitHub Actions 会自动使用这些 secrets：

```yaml
# 在 .github/workflows/deploy.yml 中
- name: Build with environment variables
  run: |
    cat > .env << EOF
    VITE_SUPABASE_URL=${{ secrets.SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }}
    GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}
    EOF
    npm run build
```

## 🛠️ 本地开发配置

在本地开发时，创建 `.env.local` 文件：

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

**重要**: 确保 `.env.local` 已添加到 `.gitignore` 文件中！

## 🔍 故障排除

### 常见问题

1. **构建失败**: 检查 secrets 名称是否正确
2. **Supabase 连接失败**: 验证 URL 和密钥是否匹配
3. **权限错误**: 确保仓库有 Actions 权限

### 调试步骤

1. 检查 GitHub Actions 日志
2. 验证 secrets 是否正确设置
3. 确认 Supabase 项目配置正确

## 📞 获取帮助

如果遇到问题：
1. 查看 [GitHub Actions 文档](https://docs.github.com/en/actions)
2. 查看 [Supabase 文档](https://supabase.com/docs)
3. 检查项目的 Issues 页面