/**
 * 邮件模板常量
 */

export const EMAIL_TEMPLATES = {
  'zh-CN': {
    confirmation: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>欢迎加入 Vainglory BP！</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #e5e5e5;
            background-color: #0a0a0a;
            padding: 20px;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }

        .header::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
        }

        .logo {
            position: relative;
            z-index: 1;
            font-size: 32px;
            font-weight: 900;
            color: #ffffff;
            margin-bottom: 10px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .subtitle {
            position: relative;
            z-index: 1;
            font-size: 16px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
        }

        .content {
            padding: 40px 30px;
        }

        .welcome-text {
            font-size: 18px;
            margin-bottom: 25px;
            color: #ffffff;
        }

        .instruction {
            font-size: 16px;
            margin-bottom: 30px;
            color: #a3a3a3;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            transition: all 0.3s ease;
            margin: 20px 0;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .fallback-link {
            background-color: #1f2937;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
        }

        .fallback-link-label {
            font-size: 14px;
            color: #9ca3af;
            margin-bottom: 8px;
        }

        .fallback-link-url {
            font-size: 13px;
            color: #3b82f6;
            font-family: 'Monaco', 'Menlo', monospace;
        }

        .footer {
            background-color: #111111;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #2d2d2d;
        }

        .footer-text {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 10px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-link {
            display: inline-block;
            width: 36px;
            height: 36px;
            background-color: #1f2937;
            border-radius: 50%;
            line-height: 36px;
            text-align: center;
            margin: 0 5px;
            color: #9ca3af;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .social-link:hover {
            background-color: #3b82f6;
            color: #ffffff;
        }

        @media (max-width: 600px) {
            .header {
                padding: 30px 20px;
            }

            .content {
                padding: 30px 20px;
            }

            .cta-button {
                width: 100%;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">⚔️ Vainglory BP</div>
            <div class="subtitle">全局BP助手</div>
        </div>

        <!-- Content -->
        <div class="content">
            <h1 class="welcome-text">欢迎加入 Vainglory BP！</h1>
            <p class="instruction">感谢您注册 Vainglory BP！请点击下方按钮验证您的邮箱地址，以激活您的账户。</p>

            <!-- CTA Button -->
            <div style="text-align: center;">
                <a href="{{confirmationLink}}" class="cta-button">✉️ 验证邮箱</a>
            </div>

            <!-- Fallback Link -->
            <div class="fallback-link">
                <div class="fallback-link-label">如果按钮无法点击，请复制以下链接到浏览器地址栏：</div>
                <div class="fallback-link-url">{{confirmationLink}}</div>
            </div>

            <p style="text-align: center; font-size: 14px; color: #6b7280; margin-top: 30px;">
                此验证链接将在 1 小时后过期。
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                如果您没有创建 Vainglory BP 账户，可以安全地忽略此邮件。
            </div>
            <div class="footer-text">
                此邮件由系统自动发送，请勿回复。
            </div>
            <div class="footer-text" style="margin-top: 15px;">
                © 2024 Vainglory BP. All rights reserved.
            </div>
            <div class="social-links">
                <a href="https://vgbp.luwei.host" class="social-link">🌐</a>
            </div>
        </div>
    </div>
</body>
</html>`,
    resend: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>邮箱验证 - Vainglory BP</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #e5e5e5;
            background-color: #0a0a0a;
            padding: 20px;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .header {
            background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }

        .header::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
        }

        .logo {
            position: relative;
            z-index: 1;
            font-size: 32px;
            font-weight: 900;
            color: #ffffff;
            margin-bottom: 10px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .subtitle {
            position: relative;
            z-index: 1;
            font-size: 16px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
        }

        .content {
            padding: 40px 30px;
        }

        .alert-box {
            background-color: #1e293b;
            border-left: 4px solid #8b5cf6;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .alert-title {
            font-size: 16px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .alert-message {
            font-size: 14px;
            color: #a3a3a3;
        }

        .instruction {
            font-size: 16px;
            margin-bottom: 30px;
            color: #a3a3a3;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            transition: all 0.3s ease;
            margin: 20px 0;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .fallback-link {
            background-color: #1f2937;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
        }

        .fallback-link-label {
            font-size: 14px;
            color: #9ca3af;
            margin-bottom: 8px;
        }

        .fallback-link-url {
            font-size: 13px;
            color: #3b82f6;
            font-family: 'Monaco', 'Menlo', monospace;
        }

        .footer {
            background-color: #111111;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #2d2d2d;
        }

        .footer-text {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 10px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-link {
            display: inline-block;
            width: 36px;
            height: 36px;
            background-color: #1f2937;
            border-radius: 50%;
            line-height: 36px;
            text-align: center;
            margin: 0 5px;
            color: #9ca3af;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .social-link:hover {
            background-color: #8b5cf6;
            color: #ffffff;
        }

        @media (max-width: 600px) {
            .header {
                padding: 30px 20px;
            }

            .content {
                padding: 30px 20px;
            }

            .cta-button {
                width: 100%;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">⚔️ Vainglory BP</div>
            <div class="subtitle">全局BP助手</div>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Alert Box -->
            <div class="alert-box">
                <div class="alert-title">
                    <span>🔔</span>
                    <span>请验证您的邮箱</span>
                </div>
                <div class="alert-message">
                    您需要验证邮箱地址才能完成注册并开始使用 Vainglory BP 的所有功能。
                </div>
            </div>

            <p class="instruction">我们检测到您需要验证邮箱地址才能完成注册。请点击下方按钮验证您的邮箱：</p>

            <!-- CTA Button -->
            <div style="text-align: center;">
                <a href="{{confirmationLink}}" class="cta-button">✉️ 验证邮箱</a>
            </div>

            <!-- Fallback Link -->
            <div class="fallback-link">
                <div class="fallback-link-label">如果按钮无法点击，请复制以下链接到浏览器地址栏：</div>
                <div class="fallback-link-url">{{confirmationLink}}</div>
            </div>

            <p style="text-align: center; font-size: 14px; color: #6b7280; margin-top: 30px;">
                此验证链接将在 1 小时后过期。
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                如果您没有注册 Vainglory BP 账户，可以安全地忽略此邮件。
            </div>
            <div class="footer-text">
                此邮件由系统自动发送，请勿回复。
            </div>
            <div class="footer-text" style="margin-top: 15px;">
                © 2024 Vainglory BP. All rights reserved.
            </div>
            <div class="social-links">
                <a href="https://vgbp.luwei.host" class="social-link">🌐</a>
            </div>
        </div>
    </div>
</body>
</html>`
  },
  'en-US': {
    confirmation: `<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Vainglory BP!</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #e5e5e5;
            background-color: #0a0a0a;
            padding: 20px;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }

        .header::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
        }

        .logo {
            position: relative;
            z-index: 1;
            font-size: 32px;
            font-weight: 900;
            color: #ffffff;
            margin-bottom: 10px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .subtitle {
            position: relative;
            z-index: 1;
            font-size: 16px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
        }

        .content {
            padding: 40px 30px;
        }

        .welcome-text {
            font-size: 18px;
            margin-bottom: 25px;
            color: #ffffff;
        }

        .instruction {
            font-size: 16px;
            margin-bottom: 30px;
            color: #a3a3a3;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            transition: all 0.3s ease;
            margin: 20px 0;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .fallback-link {
            background-color: #1f2937;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
        }

        .fallback-link-label {
            font-size: 14px;
            color: #9ca3af;
            margin-bottom: 8px;
        }

        .fallback-link-url {
            font-size: 13px;
            color: #3b82f6;
            font-family: 'Monaco', 'Menlo', monospace;
        }

        .footer {
            background-color: #111111;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #2d2d2d;
        }

        .footer-text {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 10px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-link {
            display: inline-block;
            width: 36px;
            height: 36px;
            background-color: #1f2937;
            border-radius: 50%;
            line-height: 36px;
            text-align: center;
            margin: 0 5px;
            color: #9ca3af;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .social-link:hover {
            background-color: #3b82f6;
            color: #ffffff;
        }

        @media (max-width: 600px) {
            .header {
                padding: 30px 20px;
            }

            .content {
                padding: 30px 20px;
            }

            .cta-button {
                width: 100%;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">⚔️ Vainglory BP</div>
            <div class="subtitle">Global BP Assistant</div>
        </div>

        <!-- Content -->
        <div class="content">
            <h1 class="welcome-text">Welcome to Vainglory BP!</h1>
            <p class="instruction">Thank you for signing up for Vainglory BP! Please click the button below to verify your email address and activate your account.</p>

            <!-- CTA Button -->
            <div style="text-align: center;">
                <a href="{{confirmationLink}}" class="cta-button">✉️ Verify Email</a>
            </div>

            <!-- Fallback Link -->
            <div class="fallback-link">
                <div class="fallback-link-label">If the button doesn't work, please copy and paste this link into your browser:</div>
                <div class="fallback-link-url">{{confirmationLink}}</div>
            </div>

            <p style="text-align: center; font-size: 14px; color: #6b7280; margin-top: 30px;">
                This verification link will expire in 1 hour.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                If you didn't create a Vainglory BP account, you can safely ignore this email.
            </div>
            <div class="footer-text">
                This email was sent automatically, please do not reply.
            </div>
            <div class="footer-text" style="margin-top: 15px;">
                © 2024 Vainglory BP. All rights reserved.
            </div>
            <div class="social-links">
                <a href="https://vgbp.luwei.host" class="social-link">🌐</a>
            </div>
        </div>
    </div>
</body>
</html>`,
    resend: `<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Vainglory BP</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #e5e5e5;
            background-color: #0a0a0a;
            padding: 20px;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .header {
            background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }

        .header::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
        }

        .logo {
            position: relative;
            z-index: 1;
            font-size: 32px;
            font-weight: 900;
            color: #ffffff;
            margin-bottom: 10px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .subtitle {
            position: relative;
            z-index: 1;
            font-size: 16px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
        }

        .content {
            padding: 40px 30px;
        }

        .alert-box {
            background-color: #1e293b;
            border-left: 4px solid #8b5cf6;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .alert-title {
            font-size: 16px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .alert-message {
            font-size: 14px;
            color: #a3a3a3;
        }

        .instruction {
            font-size: 16px;
            margin-bottom: 30px;
            color: #a3a3a3;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            transition: all 0.3s ease;
            margin: 20px 0;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .fallback-link {
            background-color: #1f2937;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
        }

        .fallback-link-label {
            font-size: 14px;
            color: #9ca3af;
            margin-bottom: 8px;
        }

        .fallback-link-url {
            font-size: 13px;
            color: #3b82f6;
            font-family: 'Monaco', 'Menlo', monospace;
        }

        .footer {
            background-color: #111111;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #2d2d2d;
        }

        .footer-text {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 10px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-link {
            display: inline-block;
            width: 36px;
            height: 36px;
            background-color: #1f2937;
            border-radius: 50%;
            line-height: 36px;
            text-align: center;
            margin: 0 5px;
            color: #9ca3af;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .social-link:hover {
            background-color: #8b5cf6;
            color: #ffffff;
        }

        @media (max-width: 600px) {
            .header {
                padding: 30px 20px;
            }

            .content {
                padding: 30px 20px;
            }

            .cta-button {
                width: 100%;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">⚔️ Vainglory BP</div>
            <div class="subtitle">Global BP Assistant</div>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Alert Box -->
            <div class="alert-box">
                <div class="alert-title">
                    <span>🔔</span>
                    <span>Please verify your email</span>
                </div>
                <div class="alert-message">
                    You need to verify your email address to complete registration and start using all Vainglory BP features.
                </div>
            </div>

            <p class="instruction">We detected that you need to verify your email address to complete registration. Please click the button below to verify your email:</p>

            <!-- CTA Button -->
            <div style="text-align: center;">
                <a href="{{confirmationLink}}" class="cta-button">✉️ Verify Email</a>
            </div>

            <!-- Fallback Link -->
            <div class="fallback-link">
                <div class="fallback-link-label">If the button doesn't work, please copy and paste this link into your browser:</div>
                <div class="fallback-link-url">{{confirmationLink}}</div>
            </div>

            <p style="text-align: center; font-size: 14px; color: #6b7280; margin-top: 30px;">
                This verification link will expire in 1 hour.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                If you didn't register for a Vainglory BP account, you can safely ignore this email.
            </div>
            <div class="footer-text">
                This email was sent automatically, please do not reply.
            </div>
            <div class="footer-text" style="margin-top: 15px;">
                © 2024 Vainglory BP. All rights reserved.
            </div>
            <div class="social-links">
                <a href="https://vgbp.luwei.host" class="social-link">🌐</a>
            </div>
        </div>
    </div>
</body>
</html>`
  }
} as const;