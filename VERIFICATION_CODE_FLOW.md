# 验证码注册流程说明

## 概述

为了解决 Supabase 重复邮箱注册时的错误处理问题，我们实现了一个验证码注册流程。当用户尝试使用已存在的邮箱注册时，系统会自动切换到验证码模式。

## 工作流程

### 1. 新用户注册（邮箱未存在）
```
用户输入邮箱和密码 → 正常注册流程 → 发送邮件验证链接 → 用户点击邮件链接完成验证
```

### 2. 重复邮箱注册（验证码流程）
```
用户输入已存在邮箱 → 检测到重复邮箱 → 发送验证码 → 用户输入验证码 → 完成注册/登录
```

## 技术实现

### 核心文件

1. **services/verificationService.ts** - 验证码服务
   - 生成6位数字验证码
   - 存储验证码到内存（开发环境）
   - 验证验证码有效性
   - 处理过期和重试逻辑

2. **components/VerificationCodeForm.tsx** - 验证码UI组件
   - 6位数字输入框
   - 倒计时重发功能
   - 验证状态反馈
   - 用户友好的错误提示

3. **hooks/useAuth.ts** - 认证逻辑增强
   - `sendVerificationCode()` - 发送验证码
   - `signUpWithVerificationCode()` - 验证码注册
   - 增强的重复邮箱检测

4. **components/AuthForm.tsx** - 表单组件更新
   - 支持验证码流程集成
   - 智能路由到合适的注册方式

## 错误处理改进

### Supabase 错误码匹配
```typescript
const isDuplicateEmail =
  errorMessage.includes('user already registered') ||
  errorMessage.includes('duplicate') ||
  errorMessage.includes('already exists') ||
  errorMessage.includes('database error saving new user') ||
  errorCode === 'unexpected_failure' ||  // Supabase实际返回的错误码
  error.status === 422 ||
  error.status === 400;
```

### 验证码安全特性
- 10分钟有效期
- 最多3次尝试机会
- 1分钟发送间隔限制
- 自动过期清理

## 开发环境特性

在开发环境中，验证码会直接显示在界面上：

```
验证码已生成: 123456（开发模式，实际环境中将通过邮件发送）
```

这便于测试和调试，无需配置真实的邮件服务。

## 生产环境配置

### 数据库表结构
```sql
CREATE TABLE verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  used BOOLEAN DEFAULT FALSE
);
```

### 邮件服务集成
生产环境中需要：
1. 配置真实的SMTP服务
2. 替换 `verificationService.ts` 中的邮件发送逻辑
3. 使用数据库存储验证码而非内存

## 用户体验

### 优点
1. **无缝切换** - 用户无需关心使用哪种验证方式
2. **即时反馈** - 验证码立即可用，无需等待邮件
3. **安全性** - 具备完整的验证码安全机制
4. **兼容性** - 保持原有邮件验证流程不变

### UI/UX 特性
- 6位独立输入框，自动跳转
- 60秒重发倒计时
- 清晰的错误提示和成功反馈
- 邮箱脱敏显示（如：us***@example.com）

## 测试步骤

1. **新用户注册**
   - 输入新邮箱
   - 应该收到邮件验证链接

2. **重复邮箱注册**
   - 输入已存在的邮箱
   - 应该看到验证码输入界面
   - 输入显示的验证码完成验证

3. **错误处理测试**
   - 输入错误验证码（应该有剩余次数提示）
   - 等待验证码过期（应该提示重新获取）
   - 频繁发送验证码（应该有冷却时间提示）

## 未来改进

1. **邮件服务集成** - 接入真实的邮件发送服务
2. **数据库持久化** - 使用数据库存储验证码
3. **短信验证** - 支持手机号验证码
4. **速率限制** - 更严格的全局速率限制
5. **国际化** - 支持多语言界面

## 故障排除

### 常见问题

1. **验证码不显示**
   - 检查开发环境检测逻辑
   - 确认 `process.env.NODE_ENV` 设置

2. **重复邮箱检测失败**
   - 检查 Supabase 错误码匹配逻辑
   - 查看浏览器控制台的网络请求

3. **验证码验证失败**
   - 确认验证码未过期
   - 检查尝试次数限制

### 调试方法

```javascript
// 在浏览器控制台中
import { verificationService } from './services/verificationService';

// 查看当前存储的验证码
verificationService.getStoredCode('test@example.com');

// 手动清理过期验证码
verificationService.cleanupExpiredCodes();
```