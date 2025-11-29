# 阿里云 DNS 配置指南
## 域名：vgbp.luwei.host

### 🌐 访问阿里云域名控制台
1. 登录：https://wanwang.aliyun.com/
2. 进入 **"域名解析"**
3. 选择你的顶级域名 `luwei.host`

### 📋 DNS 配置详情

#### 方案 A：CNAME 记录（推荐，最简单）
```
记录类型: CNAME
主机记录: vgbp
解析线路: 默认
记录值: huang1074867514.github.io
TTL: 600 (10分钟)
```

#### 方案 B：A 记录（更稳定）
```
记录类型: A
主机记录: vgbp
解析线路: 默认
记录值: 185.199.108.153
TTL: 600

记录类型: A
主机记录: vgbp
解析线路: 默认
记录值: 185.199.109.153
TTL: 600

记录类型: A
主机记录: vgbp
解析线路: 默认
记录值: 185.199.110.153
TTL: 600

记录类型: A
主机记录: vgbp
解析线路: 默认
记录值: 185.199.111.153
TTL: 600
```

### 🔧 详细操作步骤

1. **登录阿里云控制台**
   - 访问：https://wanwang.aliyun.com/
   - 使用你的阿里云账号登录

2. **进入域名解析**
   - 点击顶部菜单 "产品" → "域名" → "域名解析"
   - 或者直接访问：https://dns.console.aliyun.com/

3. **选择顶级域名**
   - 在域名列表中找到 `luwei.host`
   - 点击 "解析设置"

4. **添加记录**
   - 点击 "添加记录"
   - 填写上述信息（推荐 CNAME 记录）
   - 点击 "确认"

### ⚡ 推荐使用 CNAME 记录的优势

- ✅ **设置简单**：只需要一条记录
- ✅ **自动更新**：GitHub IP 变化时无需修改
- ✅ **维护方便**：无需关注 GitHub 的 IP 变化
- ✅ **可靠性高**：GitHub 自动管理后端 IP

### 📱 手机端配置（使用阿里云 App）

1. 下载 **"阿里云"** App
2. 登录你的账号
3. 进入 **"域名"** → **"域名解析"**
4. 选择 `luwei.host`
5. 添加上述 DNS 记录

### ⏰ 生效时间

- **DNS 生效**：通常 5-30 分钟
- **全球生效**：可能需要 1-24 小时
- **HTTPS 证书**：DNS 生效后几分钟内自动配置

### 🔍 验证配置

#### 1. 检查 DNS 解析
```bash
# Windows
nslookup vgbp.luwei.host

# Mac/Linux
dig vgbp.luwei.host
```

#### 2. 检查 CNAME 记录
```bash
dig CNAME vgbp.luwei.host
```

#### 3. 测试网站访问
访问：https://vgbp.luwei.host

### 🚀 GitHub Pages 设置

DNS 配置完成后，在 GitHub 中设置：

1. **访问项目设置**
   - 打开：https://github.com/huang1074867514/-/settings/pages

2. **添加自定义域名**
   - 在 "Custom domain" 中输入：`vgbp.luwei.host`
   - 点击 "Save"

3. **启用 HTTPS**
   - ✅ 勾选 "Enforce HTTPS"
   - 等待证书配置完成（几分钟）

### ⚠️ 常见问题

#### Q: CNAME 和 A 记录选哪个？
- **CNAME**：设置简单，推荐新手使用
- **A 记录**：稍微复杂，但更稳定

#### Q: DNS 不生效怎么办？
- 检查记录是否正确输入
- 清除本地 DNS 缓存
- 使用在线 DNS 检查工具
- 等待更长时间（最多 24 小时）

#### Q: 访问时显示 404 错误？
- 检查 DNS 配置
- 确认 GitHub Pages 设置正确
- 检查 CNAME 文件内容

### 🌐 最终效果

配置成功后：
- 🌐 访问地址：https://vgbp.luwei.host
- 🔒 自动 HTTPS 证书
- ⚡ GitHub CDN 加速
- 📱 完美的响应式设计

### 📞 需要帮助？

如果配置过程中遇到问题：
1. 查看阿里云帮助文档
2. 使用 DNS 检查工具：https://www.nslookup.io/
3. 告诉我具体的错误信息