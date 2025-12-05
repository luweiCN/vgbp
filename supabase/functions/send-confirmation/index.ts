import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { EmailService } from "../shared/email-service.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept-language",
};

interface SendConfirmationRequest {
  email: string;
  confirmationLink?: string;
  language?: 'zh-CN' | 'en-US';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, confirmationLink, language }: SendConfirmationRequest =
      await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      // 检测语言以返回相应的错误消息
      const detectedLanguage = language || detectLanguageFromHeaders(req.headers);
      const errorMessage = detectedLanguage === 'zh-CN'
        ? "请提供有效的邮箱地址"
        : "Please provide a valid email address";

      return new Response(
        JSON.stringify({
          error: "Invalid email format",
          message: errorMessage,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("📧 Sending confirmation email for new registration:", email);

    // 使用新的邮件发送服务
    const result = await EmailService.sendMultilingualEmail(
      email.toLowerCase(),
      'confirmation',
      { confirmationLink: confirmationLink || "#" },
      language
    );

    if (result.success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: result.message,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: "Email sending failed",
          message: result.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

  } catch (error) {
    console.error("Error sending confirmation email:", error);

    // 检测语言以返回相应的错误消息
    const detectedLanguage = detectLanguageFromHeaders(req.headers);
    const errorMessage = detectedLanguage === 'zh-CN'
      ? "发送验证邮件时发生错误，请稍后重试"
      : "An error occurred while sending the verification email, please try again later";

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * 从请求头检测语言偏好
 */
function detectLanguageFromHeaders(headers: Headers): 'zh-CN' | 'en-US' {
  const acceptLanguage = headers.get('accept-language') || '';
  if (acceptLanguage.includes('zh')) return 'zh-CN';
  if (acceptLanguage.includes('en')) return 'en-US';
  return 'zh-CN'; // 默认中文
}