import { EMAIL_TEMPLATES } from './email-templates.ts';

export interface EmailTemplate {
  subject: string;
  htmlBody: string;
}

export type EmailLanguage = 'zh-CN' | 'en-US';

/**
 * 邮件国际化工具类
 */
export class EmailI18nUtils {
  private static templateCache = new Map<string, EmailTemplate>();

  /**
   * 检测用户语言偏好
   * @param email 用户邮箱
   * @param headers 请求头
   * @returns 语言代码
   */
  static detectLanguage(email?: string, headers?: Headers): EmailLanguage {
    // 1. 从请求头获取语言偏好
    const acceptLanguage = headers?.get('accept-language') || '';
    if (acceptLanguage.includes('zh')) return 'zh-CN';
    if (acceptLanguage.includes('en')) return 'en-US';

    // 2. 从邮箱域名推断
    if (email) {
      const domain = email.toLowerCase().split('@')[1];
      // 常见中文邮箱服务
      const chineseEmailDomains = [
        'qq.com', '163.com', '126.com', 'sina.com', 'sohu.com',
        'yeah.net', '139.com', '189.cn', 'aliyun.com', 'foxmail.com'
      ];
      if (chineseEmailDomains.includes(domain)) {
        return 'zh-CN';
      }
    }

    // 3. 默认使用中文
    return 'zh-CN';
  }

  /**
   * 加载邮件模板
   * @param templateName 模板名称
   * @param language 语言代码
   * @returns 模板内容
   */
  static loadTemplate(
    templateName: 'confirmation' | 'resend',
    language: EmailLanguage
  ): EmailTemplate {
    const cacheKey = `${templateName}-${language}`;

    // 检查缓存
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }

    try {
      // 使用内联模板常量
      const templateContent = EMAIL_TEMPLATES[language][templateName];

      // 解析模板获取主题和内容
      const subjectMatch = templateContent.match(/<title>(.*?)<\/title>/);
      const subject = subjectMatch ? subjectMatch[1] : 'Vainglory BP Notification';

      const template: EmailTemplate = {
        subject,
        htmlBody: templateContent
      };

      // 缓存模板
      this.templateCache.set(cacheKey, template);

      return template;
    } catch (error) {
      console.error(`Failed to load template: ${templateName}-${language}`, error);
      // 回退到默认模板
      return this.getDefaultTemplate(templateName, language);
    }
  }

  /**
   * 替换模板变量
   * @param template 模板内容
   * @param variables 变量对象
   * @returns 替换后的内容
   */
  static replaceTemplateVariables(
    template: string,
    variables: Record<string, any>
  ): string {
    let result = template;

    // 替换 {{variable}} 格式的变量
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * 获取默认模板（当模板文件不存在时使用）
   */
  private static getDefaultTemplate(
    templateName: string,
    language: EmailLanguage
  ): EmailTemplate {
    const isZhCN = language === 'zh-CN';

    const templates = {
      'zh-CN': {
        confirmation: {
          subject: '[Vainglory BP] 请验证您的邮箱地址',
          body: `
            <p>感谢您注册 Vainglory BP！</p>
            <p>请点击下方链接验证您的邮箱：</p>
            <p><a href="{{confirmationLink}}">验证邮箱</a></p>
            <p>如果按钮无法点击，请复制以下链接到浏览器：</p>
            <p>{{confirmationLink}}</p>
            <p>此验证链接将在 24 小时后过期。</p>
          `
        },
        resend: {
          subject: '[Vainglory BP] 重新发送验证邮件',
          body: `
            <p>您请求重新发送验证邮件。</p>
            <p>请点击下方链接完成邮箱验证：</p>
            <p><a href="{{confirmationLink}}">验证邮箱</a></p>
            <p>如果按钮无法点击，请复制以下链接到浏览器：</p>
            <p>{{confirmationLink}}</p>
            <p>此验证链接将在 24 小时后过期。</p>
          `
        }
      },
      'en-US': {
        confirmation: {
          subject: '[Vainglory BP] Please verify your email address',
          body: `
            <p>Thank you for signing up for Vainglory BP!</p>
            <p>Please click the link below to verify your email:</p>
            <p><a href="{{confirmationLink}}">Verify Email</a></p>
            <p>If the button doesn't work, please copy and paste this link:</p>
            <p>{{confirmationLink}}</p>
            <p>This verification link will expire in 24 hours.</p>
          `
        },
        resend: {
          subject: '[Vainglory BP] Resend verification email',
          body: `
            <p>You requested to resend the verification email.</p>
            <p>Please click the link below to complete your email verification:</p>
            <p><a href="{{confirmationLink}}">Verify Email</a></p>
            <p>If the button doesn't work, please copy and paste this link:</p>
            <p>{{confirmationLink}}</p>
            <p>This verification link will expire in 24 hours.</p>
          `
        }
      }
    };

    const template = templates[language][templateName];
    return {
      subject: template.subject,
      htmlBody: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${template.subject}</title>
        </head>
        <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            ${template.body}
          </div>
        </body>
        </html>
      `
    };
  }

  /**
   * 清除模板缓存（用于开发环境热重载）
   */
  static clearCache(): void {
    this.templateCache.clear();
  }
}