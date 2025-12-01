# GitHub Actions 健康检查

这个 GitHub Actions 工作流用于定期检查 Supabase 项目状态，防止项目因长时间不活跃而被暂停。

## 工作流说明

### `health-check.yml`
- **运行频率**: 每周一上午 10:00 UTC (北京时间 18:00)
- **支持手动触发**: 可以在 GitHub Actions 页面手动运行
- **检查内容**:
  - Supabase API 连接状态
  - 数据库连接状态
  - Edge Functions 服务状态

## 配置步骤

### 1. 获取 Supabase 项目信息

在 Supabase Dashboard 中找到：
- **Project URL**: `https://your-project-id.supabase.co`
- **anon public key**: 在 Settings > API 中找到

### 2. 配置 GitHub Secrets

在 GitHub 仓库中设置以下 Secrets：

1. 进入仓库的 `Settings` > `Secrets and variables` > `Actions`
2. 点击 `New repository secret`
3. 添加以下两个密钥：

#### `SUPABASE_URL`
```
https://hvbqzfdmmoupwvbwegug.supabase.co
```

#### `SUPABASE_ANON_KEY`
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
(替换为你的实际 anon key)

### 3. 测试工作流

配置完成后，你可以：
1. 提交代码到 GitHub
2. 在 Actions 页面手动触发工作流进行测试
3. 查看运行日志确认配置正确

## 自定义配置

### 修改运行频率
编辑 `.github/workflows/health-check.yml` 中的 cron 表达式：

```yaml
schedule:
  - cron: '0 10 * * 1'  # 每周一 10:00 UTC
```

常用 cron 表达式：
- `0 10 * * 1` - 每周一
- `0 10 * * 0` - 每周日
- `0 10 1,15 * *` - 每月 1 日和 15 日
- `0 */6 * * *` - 每 6 小时

### 添加更多检查
你可以在工作流中添加更多健康检查，比如：
- 检查特定数据表
- 调用特定的 Edge Functions
- 检查存储服务

## 监控和故障排除

- 查看运行日志: 在 GitHub Actions 页面查看详细输出
- 失败通知: 工作流失败时会自动发送通知
- 手动运行: 可以随时手动触发健康检查

## 注意事项

1. **安全性**: 确保 Supabase 密钥安全存储在 GitHub Secrets 中
2. **频率限制**: 不要设置过于频繁的检查，避免触发 API 限制
3. **成本**: GitHub Actions 在免费额度内运行，注意使用量