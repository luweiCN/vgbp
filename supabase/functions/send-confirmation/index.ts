import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendConfirmationRequest {
  email: string;
  confirmationLink?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, confirmationLink }: SendConfirmationRequest =
      await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({
          error: "Invalid email format",
          message: "请提供有效的邮箱地址",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("📧 Sending confirmation email for new registration:", email);

    // Check if we have Feishu SMTP credentials
    const feishuSmtpUser = Deno.env.get("FEISHU_SMTP_USER");
    const feishuSmtpPass = Deno.env.get("FEISHU_SMTP_PASS");

    if (!feishuSmtpUser || !feishuSmtpPass) {
      return new Response(
        JSON.stringify({
          error: "Feishu SMTP not configured",
          message: "邮件服务未配置",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Send email using Feishu SMTP
    try {
      // Create email content with proper headers
      const emailContent = [
        `From: Vainglory BP <${feishuSmtpUser}>`,
        `To: ${email.toLowerCase()}`,
        `Subject: [Vainglory BP] Please verify your email address`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=UTF-8`,
        `X-Priority: 3`,
        `X-Mailer: Vainglory BP Email System`,
        `Reply-To: noreply@vainglory-bp.com`,
        `List-Unsubscribe: <mailto:unsubscribe@vainglory-bp.com>`,
        "",
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification - Vainglory BP</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto;">
    <tr>
      <td style="padding: 30px 20px; background-color: #f8f9fa; border: 1px solid #e9ecef;">
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <h1 style="color: #2c3e50; margin: 0; font-size: 24px; font-weight: 600;">Vainglory BP</h1>
              <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 14px;">Tactical Draft Assistant</p>
            </td>
          </tr>
        </table>

        <!-- Main Content -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; margin: 20px 0; border: 1px solid #dee2e6; border-radius: 6px;">
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 20px; font-weight: 500;">Verify Your Email Address</h2>

              <p style="font-size: 16px; color: #495057; margin: 0 0 25px 0; line-height: 1.5;">
                Thank you for signing up for Vainglory BP! Please click the button below to verify your email address and start using our tactical draft assistant.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${confirmationLink || "#"}"
                       style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 14px; border: 1px solid #007bff;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              ${
                confirmationLink
                  ? `
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 25px;">
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; border: 1px solid #e9ecef;">
                    <p style="color: #6c757d; font-size: 13px; margin: 0 0 8px 0; font-weight: 500;">
                      If the button above doesn't work, please copy and paste this link into your browser:
                    </p>
                    <p style="word-break: break-all; background-color: #ffffff; padding: 12px; border-radius: 4px; font-size: 11px; font-family: 'Courier New', monospace; border: 1px solid #dee2e6; margin: 0;">
                      ${confirmationLink}
                    </p>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center;">
              <p style="color: #6c757d; font-size: 12px; margin: 0 0 8px 0;">
                This verification link will expire in 24 hours.
              </p>
              <p style="color: #6c757d; font-size: 12px; margin: 0 0 8px 0;">
                If you didn't create a Vainglory BP account, you can safely ignore this email.
              </p>
              <p style="color: #adb5bd; font-size: 11px; margin: 15px 0 0 0;">
                This email was sent automatically. Please do not reply to this message.
              </p>
              <p style="color: #adb5bd; font-size: 10px; margin: 8px 0 0 0;">
                © 2024 Vainglory BP. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      ].join("\r\n");

      // Send email via Feishu SMTP using Deno's net library
      const encoder = new TextEncoder();
      const data = encoder.encode(emailContent);

      // Connect to Feishu SMTP server
      const conn = await Deno.connectTls({
        hostname: "smtp.feishu.cn",
        port: 465,
      });

      // SMTP commands
      const readResponse = async () => {
        const buffer = new Uint8Array(1024);
        const bytesRead = await conn.read(buffer);
        if (bytesRead === null) return null;
        return new TextDecoder().decode(buffer.subarray(0, bytesRead));
      };

      // EHLO
      await conn.write(encoder.encode("EHLO localhost\r\n"));
      await readResponse();

      // AUTH LOGIN
      await conn.write(encoder.encode("AUTH LOGIN\r\n"));
      await readResponse();

      // Username (base64 encoded)
      const usernameEncoded = btoa(feishuSmtpUser);
      await conn.write(encoder.encode(usernameEncoded + "\r\n"));
      await readResponse();

      // Password (base64 encoded)
      const passwordEncoded = btoa(feishuSmtpPass);
      await conn.write(encoder.encode(passwordEncoded + "\r\n"));
      await readResponse();

      // MAIL FROM
      await conn.write(encoder.encode(`MAIL FROM:<${feishuSmtpUser}>\r\n`));
      await readResponse();

      // RCPT TO
      await conn.write(encoder.encode(`RCPT TO:<${email.toLowerCase()}>\r\n`));
      await readResponse();

      // DATA
      await conn.write(encoder.encode("DATA\r\n"));
      await readResponse();

      // Email content
      await conn.write(data);
      await conn.write(encoder.encode("\r\n.\r\n"));
      await readResponse();

      // QUIT
      await conn.write(encoder.encode("QUIT\r\n"));
      conn.close();

      console.log("✅ Confirmation email sent successfully via Feishu SMTP");
      return new Response(
        JSON.stringify({
          success: true,
          message: "验证邮件已发送，请检查您的邮箱（包括垃圾邮件文件夹）",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } catch (smtpError) {
      console.error("❌ Feishu SMTP error:", smtpError);
      throw new Error("Failed to send email via SMTP: " + smtpError.message);
    }
  } catch (error) {
    console.error("Error sending confirmation email:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "发送验证邮件时发生错误，请稍后重试",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

