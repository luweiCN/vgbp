import { EmailI18nUtils, EmailLanguage, EmailTemplate } from './i18n-utils.ts';

/**
 * 邮件发送服务
 * 使用 Supabase 内置的邮件发送功能，避免直接连接 SMTP
 */
export class EmailService {
  /**
   * 发送多语言邮件
   * @param to 收件人邮箱
   * @param templateName 模板名称
   * @param variables 模板变量
   * @param language 语言代码（可选，自动检测）
   */
  static async sendMultilingualEmail(
    to: string,
    templateName: 'confirmation' | 'resend',
    variables: Record<string, any>,
    language?: EmailLanguage
  ): Promise<{ success: boolean; message: string }> {
    console.log(`📧 开始发送多语言邮件`);
    console.log(`   收件人: ${to}`);
    console.log(`   模板类型: ${templateName}`);
    console.log(`   指定语言: ${language || '未指定（自动检测）'}`);

    try {
      // 检测语言偏好
      const targetLanguage = language || EmailI18nUtils.detectLanguage(to);
      console.log(`   目标语言: ${targetLanguage}`);

      // 加载对应语言的模板
      console.log(`📄 正在加载 ${targetLanguage} 语言的 ${templateName} 模板...`);
      const template = EmailI18nUtils.loadTemplate(templateName, targetLanguage);
      console.log(`   模板主题: ${template.subject}`);

      // 替换模板变量
      console.log(`🔄 正在替换模板变量...`);
      console.log(`   变量列表:`, Object.keys(variables));
      const htmlBody = EmailI18nUtils.replaceTemplateVariables(template.htmlBody, variables);
      console.log(`   模板变量替换完成，HTML内容长度: ${htmlBody.length} 字符`);

      // 尝试使用邮件服务发送
      console.log(`📤 正在通过HTTP API发送邮件...`);
      const result = await this.sendViaHttpApi(to, template.subject, htmlBody);

      if (result) {
        console.log(`✅ 邮件发送成功！`);
        return {
          success: true,
          message: targetLanguage === 'zh-CN'
            ? '邮件发送成功'
            : 'Email sent successfully'
        };
      } else {
        console.log(`❌ 邮件发送失败`);
        return {
          success: false,
          message: targetLanguage === 'zh-CN'
            ? '邮件发送失败，请稍后重试'
            : 'Failed to send email, please try again'
        };
      }

    } catch (error) {
      console.error(`❌ 发送多语言邮件时发生错误:`, error);
      console.error(`   错误类型:`, error.constructor.name);
      console.error(`   错误消息:`, error.message);
      return {
        success: false,
        message: language === 'zh-CN'
          ? '发送邮件失败，请稍后重试'
          : 'Failed to send email, please try again'
      };
    }
  }

  /**
   * 通过 HTTP API 发送邮件
   * 支持 Resend 或其他兼容的邮件服务
   */
  private static async sendViaHttpApi(
    to: string,
    subject: string,
    htmlBody: string
  ): Promise<boolean> {
    console.log(`🔍 检查可用的邮件服务配置...`);

    // 优先尝试飞书 SMTP (通过环境变量)
    const feishuSmtpUser = Deno.env.get('FEISHU_SMTP_USER');
    const feishuSmtpPass = Deno.env.get('FEISHU_SMTP_PASS');
    if (feishuSmtpUser && feishuSmtpPass) {
      console.log(`📌 检测到飞书SMTP配置: ${feishuSmtpUser}`);
      console.log(`📧 尝试通过飞书SMTP发送邮件...`);
      // 注意：Deno.connectTls 在某些 Edge Functions 环境中可能可用
      try {
        return await this.sendViaFeishuSmtp(to, subject, htmlBody, feishuSmtpUser, feishuSmtpPass);
      } catch (error) {
        console.error(`❌ 飞书SMTP发送失败:`);
        console.error(`   错误类型:`, typeof error);
        console.error(`   错误消息:`, error.message);
        console.error(`   错误详情:`, error);
        // 继续尝试其他方法
      }
    } else {
      console.log(`ℹ️ 未检测到飞书SMTP配置`);
    }

    // 尝试 Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
      console.log(`📌 检测到Resend API配置`);
      console.log(`📧 尝试通过Resend API发送邮件...`);
      return await this.sendViaResend(to, subject, htmlBody, resendApiKey);
    } else {
      console.log(`ℹ️ 未检测到Resend API配置`);
    }

    // 尝试飞书邮件 API（如果配置了的话）
    const feishuEmailUrl = Deno.env.get('FEISHU_EMAIL_API_URL');
    const feishuEmailKey = Deno.env.get('FEISHU_EMAIL_API_KEY');
    if (feishuEmailUrl && feishuEmailKey) {
      console.log(`📌 检测到飞书邮件API配置: ${feishuEmailUrl}`);
      console.log(`📧 尝试通过飞书邮件API发送邮件...`);
      return await this.sendViaFeishu(to, subject, htmlBody, feishuEmailUrl, feishuEmailKey);
    } else {
      console.log(`ℹ️ 未检测到飞书邮件API配置`);
    }

    // 通用邮件服务（如果配置了的话）
    const emailServiceUrl = Deno.env.get('EMAIL_SERVICE_URL');
    const emailServiceKey = Deno.env.get('EMAIL_SERVICE_KEY');
    if (emailServiceUrl && emailServiceKey) {
      console.log(`📌 检测到通用邮件服务配置: ${emailServiceUrl}`);
      console.log(`📧 尝试通过通用邮件服务发送邮件...`);
      return await this.sendViaGenericService(to, subject, htmlBody, emailServiceUrl, emailServiceKey);
    } else {
      console.log(`ℹ️ 未检测到通用邮件服务配置`);
    }

    console.warn(`⚠️ 未配置任何邮件服务，跳过邮件发送`);
    console.warn(`   可配置的环境变量包括:`);
    console.warn(`   - FEISHU_SMTP_USER / FEISHU_SMTP_PASS (飞书SMTP)`);
    console.warn(`   - RESEND_API_KEY (Resend API)`);
    console.warn(`   - FEISHU_EMAIL_API_URL / FEISHU_EMAIL_API_KEY (飞书邮件API)`);
    console.warn(`   - EMAIL_SERVICE_URL / EMAIL_SERVICE_KEY (通用邮件服务)`);
    return false;
  }

  /**
   * 通过飞书 SMTP 发送邮件（需要 TCP 连接支持）
   * 注意：Edge Functions 不支持 Deno.connectTls，此方法会失败
   */
  private static async sendViaFeishuSmtp(
    to: string,
    subject: string,
    htmlBody: string,
    username: string,
    password: string
  ): Promise<boolean> {
    // 构建邮件内容
    const emailContent = [
      `From: Vainglory BP <${username}>`,
      `To: ${to.toLowerCase()}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      `X-Priority: 3`,
      `X-Mailer: Vainglory BP Email System`,
      `Reply-To: noreply@vainglory-bp.com`,
      `List-Unsubscribe: <mailto:unsubscribe@vainglory-bp.com>`,
      '',
      htmlBody
    ].join('\r\n');

    const encoder = new TextEncoder();
    const data = encoder.encode(emailContent);

    // 连接到飞书 SMTP 服务器
    const conn = await Deno.connectTls({
      hostname: "smtp.feishu.cn",
      port: 465,
    });

    const readResponse = async () => {
      const decoder = new TextDecoder();
      let response = '';

      while (true) {
        const buffer = new Uint8Array(1024);
        const bytesRead = await conn.read(buffer);

        if (bytesRead === null) {
          break;
        }

        const chunk = decoder.decode(buffer, { stream: false });
        response += chunk;

        // SMTP 响应以 \r\n 结尾
        if (response.includes('\r\n')) {
          break;
        }
      }

      return response;
    };

    try {
      console.log("Starting SMTP communication...");

      // 读取服务器欢迎信息
      const welcomeResponse = await readResponse();
      console.log("Welcome Response:", welcomeResponse);
      if (!welcomeResponse || !welcomeResponse.startsWith('220')) {
        throw new Error(`Server welcome failed: ${welcomeResponse}`);
      }

      // EHLO
      console.log("Sending EHLO...");
      await conn.write(encoder.encode("EHLO localhost\r\n"));
      const ehloResponse = await readResponse();
      console.log("EHLO Response:", ehloResponse);
      if (!ehloResponse || !ehloResponse.startsWith('250')) {
        throw new Error(`EHLO failed: ${ehloResponse}`);
      }

      // AUTH LOGIN
      console.log("Starting AUTH LOGIN...");
      await conn.write(encoder.encode("AUTH LOGIN\r\n"));
      const authResponse = await readResponse();
      console.log("AUTH Response:", authResponse);
      if (!authResponse || !authResponse.startsWith('334')) {
        throw new Error(`AUTH LOGIN failed: ${authResponse}`);
      }

      // Username (base64 encoded)
      console.log("Sending username...");
      const usernameEncoded = btoa(username);
      await conn.write(encoder.encode(usernameEncoded + "\r\n"));
      const userResponse = await readResponse();
      console.log("Username Response:", userResponse);
      if (!userResponse || !userResponse.startsWith('334')) {
        throw new Error(`Username authentication failed: ${userResponse}`);
      }

      // Password (base64 encoded)
      console.log("Sending password...");
      const passwordEncoded = btoa(password);
      await conn.write(encoder.encode(passwordEncoded + "\r\n"));
      const passResponse = await readResponse();
      console.log("Password Response:", passResponse);
      if (!passResponse || !passResponse.startsWith('235')) {
        throw new Error(`Password authentication failed: ${passResponse}`);
      }

      // MAIL FROM
      console.log("Setting MAIL FROM...");
      await conn.write(encoder.encode(`MAIL FROM:<${username}>\r\n`));
      const mailFromResponse = await readResponse();
      console.log("MAIL FROM Response:", mailFromResponse);
      if (!mailFromResponse || !mailFromResponse.startsWith('250')) {
        throw new Error(`MAIL FROM failed: ${mailFromResponse}`);
      }

      // RCPT TO
      console.log("Setting RCPT TO...");
      await conn.write(encoder.encode(`RCPT TO:<${to.toLowerCase()}>\r\n`));
      const rcptToResponse = await readResponse();
      console.log("RCPT TO Response:", rcptToResponse);
      if (!rcptToResponse || !rcptToResponse.startsWith('250')) {
        throw new Error(`RCPT TO failed: ${rcptToResponse}`);
      }

      // DATA
      console.log("Sending DATA command...");
      await conn.write(encoder.encode("DATA\r\n"));
      const dataResponse = await readResponse();
      console.log("DATA Response:", dataResponse);
      if (!dataResponse || !dataResponse.startsWith('354')) {
        throw new Error(`DATA command failed: ${dataResponse}`);
      }

      // Email content
      console.log("Sending email content...");
      await conn.write(data);
      await conn.write(encoder.encode("\r\n.\r\n"));
      const finalResponse = await readResponse();
      console.log("Final Response:", finalResponse);

      // 检查最终响应是否成功
      if (finalResponse && finalResponse.startsWith('250')) {
        console.log("✅ Email sent successfully via Feishu SMTP");
        return true;
      } else {
        console.error("❌ Email sending failed, final response:", finalResponse);
        return false;
      }
    } catch (error) {
      console.error("❌ SMTP Error:", error);
      throw error;
    } finally {
      try {
        console.log("Closing connection...");
        await conn.write(encoder.encode("QUIT\r\n"));
        conn.close();
      } catch (e) {
        console.error("Error closing connection:", e);
      }
    }
  }

  /**
   * 通过 Resend API 发送邮件
   */
  private static async sendViaResend(
    to: string,
    subject: string,
    htmlBody: string,
    apiKey: string
  ): Promise<boolean> {
    console.log(`📡 正在调用Resend API...`);
    console.log(`   API端点: https://api.resend.com/emails`);
    console.log(`   发件人: Vainglory BP <noreply@vainglory-bp.com>`);
    console.log(`   收件人: ${to}`);
    console.log(`   主题: ${subject}`);

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.substring(0, 8)}...`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Vainglory BP <noreply@vainglory-bp.com>',
          to: [to],
          subject: subject,
          html: htmlBody
        })
      });

      console.log(`   响应状态: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Resend API错误:`);
        console.error(`   状态码: ${response.status}`);
        console.error(`   错误详情:`, errorData);
        return false;
      }

      const responseData = await response.json();
      console.log(`✅ 通过Resend API发送邮件成功！`);
      console.log(`   邮件ID: ${responseData.id}`);
      return true;
    } catch (error) {
      console.error(`❌ 通过Resend发送邮件失败:`);
      console.error(`   错误类型:`, error.constructor.name);
      console.error(`   错误消息:`, error.message);
      return false;
    }
  }

  /**
   * 通过飞书邮件 API 发送邮件（需要根据实际 API 调整）
   */
  private static async sendViaFeishu(
    to: string,
    subject: string,
    htmlBody: string,
    apiUrl: string,
    apiKey: string
  ): Promise<boolean> {
    try {
      // 注意：这里的 API 格式需要根据飞书实际 API 调整
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: to,
          subject: subject,
          content: htmlBody,
          sender: 'Vainglory BP <noreply@vainglory-bp.com>'
        })
      });

      if (!response.ok) {
        console.error('Feishu email API error:', response.status, response.statusText);
        return false;
      }

      console.log('✅ Email sent via Feishu API');
      return true;
    } catch (error) {
      console.error('Failed to send via Feishu:', error);
      return false;
    }
  }

  /**
   * 通过通用邮件服务发送邮件
   */
  private static async sendViaGenericService(
    to: string,
    subject: string,
    htmlBody: string,
    apiUrl: string,
    apiKey: string
  ): Promise<boolean> {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to,
          subject,
          html: htmlBody,
          from: 'Vainglory BP <noreply@vainglory-bp.com>'
        })
      });

      if (!response.ok) {
        console.error('Generic email service error:', response.status, response.statusText);
        return false;
      }

      console.log('✅ Email sent via generic email service');
      return true;
    } catch (error) {
      console.error('Failed to send via generic service:', error);
      return false;
    }
  }

  /**
   * 获取邮件内容用于调试
   */
  static getEmailContent(
    to: string,
    templateName: 'confirmation' | 'resend',
    variables: Record<string, any>,
    language?: EmailLanguage
  ): { subject: string; htmlBody: string; language: EmailLanguage } {
    const targetLanguage = language || EmailI18nUtils.detectLanguage(to);
    const template = EmailI18nUtils.loadTemplate(templateName, targetLanguage);
    const htmlBody = EmailI18nUtils.replaceTemplateVariables(template.htmlBody, variables);

    return {
      subject: template.subject,
      htmlBody,
      language: targetLanguage
    };
  }
}