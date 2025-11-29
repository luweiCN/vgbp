# 自定义域名配置指南

## 🌐 完整配置步骤

### 1. 购买域名（如果还没有）
推荐域名：
- `vgbp.io` - 简洁专业
- `vainglory-bp.com` - 描述性强
- `vbp.app` - 现代 .app 域名

可以在以下平台购买：
- Namecheap: https://www.namecheap.com/
- GoDaddy: https://www.godaddy.com/
- 阿里云: https://wanwang.aliyun.com/
- 腾讯云: https://cloud.tencent.com/product/cns

### 2. 配置 DNS 解析

在你的域名提供商管理后台，添加以下 DNS 记录：

#### 选项 A：A 记录（推荐）
```
类型: A
主机: @ (或空)
值: 185.199.108.153
TTL: 3600 (或默认)

类型: A
主机: @ (或空)
值: 185.199.109.153
TTL: 3600

类型: A
主机: @ (或空)
值: 185.199.110.153
TTL: 3600

类型: A
主机: @ (或空)
值: 185.199.111.153
TTL: 3600
```

#### 选项 B：CNAME 记录
```
类型: CNAME
主机: @ (或空)
值: huang1074867514.github.io
TTL: 3600
```

### 3. 项目配置（已完成）
✅ 已创建 `public/CNAME` 文件
✅ 已更新 `vite.config.ts` 配置
✅ 构建时 CNAME 文件会自动包含在 `dist/` 目录

### 4. GitHub Pages 设置
1. 访问：https://github.com/huang1074867514/-/settings/pages
2. 在 "Custom domain" 部分，输入你的域名
3. 点击 "Save"
4. 启用 "Enforce HTTPS"

### 5. 验证配置
```bash
# 检查 DNS 解析
nslookup your-domain.com

# 检查 CNAME 记录
dig CNAME your-domain.com
```

## 📋 完整流程总结

### 你需要做的：
1. **购买域名**（如果还没有）
2. **配置 DNS 记录**（A 记录或 CNAME）
3. **在 GitHub Pages 中添加自定义域名**

### 我已经完成的：
- ✅ 创建 `public/CNAME` 文件
- ✅ 更新 Vite 配置为根路径
- ✅ 准备了部署配置

## 🔧 DNS 配置示例

### 在 Namecheap 配置：
1. 登录 Namecheap
2. 进入 "Domain List"
3. 点击 "Manage" 你的域名
4. 点击 "Advanced DNS"
5. 添加 A 记录或 CNAME 记录

### 在阿里云配置：
1. 登录阿里云域名控制台
2. 选择 "域名解析"
3. 添加记录
4. 选择 A 记录或 CNAME 记录

## ⚡ 常见问题

### Q: A 记录 vs CNAME 记录？
- **A 记录**：直接指向 IP，更稳定
- **CNAME 记录**：指向 GitHub Pages 域名，设置更简单

### Q: 需要多长时间生效？
- DNS 传播：通常 5-30 分钟
- 全球生效：可能需要 24 小时

### Q: 如何知道配置成功了？
- 访问你的域名能看到应用
- GitHub Pages 设置显示绿色勾号
- 浏览器地址栏显示 HTTPS 锁图标

## 🎯 推荐的域名选择

1. **vgbp.io** - 最简洁，专业
2. **vainbp.com** - 易于记忆
3. **vgdraft.com** - 描述性强
4. **vainglory-draft.com** - 完整描述

选择一个你喜欢的域名，然后按照上述步骤配置即可！

## 📞 需要帮助？

如果你在配置过程中遇到任何问题，可以：
1. 查看你的域名提供商的帮助文档
2. 使用在线 DNS 检查工具
3. 告诉我具体的错误信息，我可以帮你排查