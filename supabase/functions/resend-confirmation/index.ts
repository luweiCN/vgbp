import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { EmailService } from "../shared/email-service.ts";
import { EmailI18nUtils } from "../shared/i18n-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept-language",
};

interface ResendRequest {
  email: string;
  language?: 'zh-CN' | 'en-US';
  redirectUrl?: string;
}

interface ResendResponse {
  success: boolean;
  message: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 只处理 POST 请求
  if (req.method !== "POST") {
    console.log(`❌ 只接受POST请求，当前请求: ${req.method}`);
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    console.log(`🚀 Resend Confirmation Edge Function 开始执行...`);
    console.log(`   请求方法: ${req.method}`);
    console.log(`   请求URL: ${req.url}`);
    console.log(`   请求头User-Agent: ${req.headers.get("user-agent") || "未知"}`);
    console.log(`   客户端IP: ${getClientIP(req)}`);

    console.log(`📥 正在读取请求体...`);
    const requestBody = await req.text();
    console.log(`   请求体长度: ${requestBody.length} 字符`);

    let requestData: ResendRequest;
    try {
      requestData = JSON.parse(requestBody);
    } catch (parseError) {
      console.error(`❌ JSON解析失败:`, parseError);
      return new Response(
        JSON.stringify({
          error: 'invalid_json',
          message: "请求格式错误"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { email, language, redirectUrl }: ResendRequest = requestData;
    const targetLanguage = language || detectLanguageFromHeaders(req.headers);

    console.log(`📋 请求参数:`);
    console.log(`   邮箱: ${email || "未提供"}`);
    console.log(`   指定语言: ${language || "未指定（自动检测）"}`);
    console.log(`   重定向URL: ${redirectUrl || "未指定"}`);
    console.log(`   目标语言: ${targetLanguage}`);

    // 验证邮箱
    if (!email || typeof email !== "string") {
      console.log(`❌ 邮箱参数缺失或无效`);
      const errorMessage = targetLanguage === 'zh-CN'
        ? "请提供邮箱地址"
        : "Please provide an email address";

      return new Response(
        JSON.stringify({
          error: 'email_required',
          message: errorMessage
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const trimmedEmail = email.toString().trim().toLowerCase();
    if (!trimmedEmail.includes("@")) {
      console.log(`❌ 邮箱格式无效: ${trimmedEmail}`);
      const errorMessage = targetLanguage === 'zh-CN'
        ? "请提供有效的邮箱地址"
        : "Please provide a valid email address";

      return new Response(
        JSON.stringify({
          error: 'invalid_email',
          message: errorMessage
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // 检查环境变量
    console.log(`🔍 检查 Supabase 环境变量...`);
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log(`   SUPABASE_URL: ${SUPABASE_URL ? "已设置" : "未设置"}`);
    console.log(`   SERVICE_KEY: ${SERVICE_KEY ? "已设置" : "未设置"}`);

    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error(`❌ Supabase 环境变量缺失`);
      console.error(`   请在 Supabase Dashboard → Settings → Edge Functions 中配置以下环境变量：`);
      console.error(`   - SUPABASE_URL: https://sxkozhhlhvxdnwirbubw.supabase.co`);
      console.error(`   - SUPABASE_SERVICE_ROLE_KEY: 你的服务密钥`);

      const errorMessage = targetLanguage === 'zh-CN'
        ? "服务器配置错误，请稍后重试"
        : "Server configuration error, please try again later";

      return new Response(
        JSON.stringify({
          error: 'server_misconfigured',
          message: errorMessage
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`✅ 环境变量配置检查通过`);

    // 构建 Admin API 请求
    console.log(`📡 正在调用 Supabase Admin API...`);
    const adminEndpoint = `${SUPABASE_URL}/auth/v1/admin/generate_link`;
    const targetDomain = redirectUrl || 'https://vgbp.luwei.host';
    console.log(`   使用重定向URL: ${targetDomain}`);

    const generateLinkBody = {
      type: 'signup',
      email: trimmedEmail,
      options: {
        redirect_to: targetDomain
      }
    };

    console.log(`   API端点: ${adminEndpoint}`);
    console.log(`   请求类型: ${generateLinkBody.type}`);
    console.log(`   邮箱: ${generateLinkBody.email}`);
    console.log(`   重定向到: ${targetDomain}`);

    const res = await fetch(adminEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify(generateLinkBody)
    });

    console.log(`   响应状态: ${res.status} ${res.statusText}`);

    const data = await res.json().catch(() => null);
    console.log(`   响应数据:`, data);

    if (!res.ok) {
      console.error(`❌ Admin API 调用失败:`);
      console.error(`   状态码: ${res.status}`);
      console.error(`   错误详情:`, data);

      const msg = data?.message || data?.error_description || data || res.statusText;
      const errorMessage = targetLanguage === 'zh-CN'
        ? `发送失败：${msg}`
        : `Failed to send: ${msg}`;

      return new Response(
        JSON.stringify({
          error: 'admin_api_failed',
          message: errorMessage,
          detail: msg
        }),
        {
          status: res.status || 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`✅ Admin API 调用成功`);

    // 提取 token 并手动构建正确的确认链接
    const token = data.hashed_token || data.token;
    if (!token) {
      console.error(`❌ 未获取到 token`);
      const errorMessage = targetLanguage === 'zh-CN'
        ? "生成验证链接失败"
        : "Failed to generate verification link";

      return new Response(
        JSON.stringify({
          error: 'token_missing',
          message: errorMessage
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // 手动构建确认链接，确保使用正确的重定向URL
    const confirmationLink = `${SUPABASE_URL}/auth/v1/verify?token=${encodeURIComponent(token)}&type=signup&redirect_to=${encodeURIComponent(targetDomain)}`;
    console.log(`   原始 Action Link: ${data.action_link}`);
    console.log(`   修正后的确认链接: ${confirmationLink}`);

    // 直接使用 EmailService 发送邮件（绕过 webhook 签名验证）
    console.log(`📧 正在使用 EmailService 发送多语言邮件...`);

    try {
      const emailResult = await EmailService.sendMultilingualEmail(
        trimmedEmail,
        'resend',  // 使用 resend 模板
        { confirmationLink: confirmationLink },
        targetLanguage
      );

      if (emailResult.success) {
        console.log(`✅ 邮件发送成功`);
      } else {
        console.error(`❌ 邮件发送失败:`, emailResult.message);
      }
    } catch (emailError) {
      console.error(`❌ 发送邮件时出错:`, emailError);
    }

    // 根据语言返回成功消息
    const successMessage = targetLanguage === 'zh-CN'
      ? "验证邮件已发送，请检查您的邮箱（包括垃圾邮件文件夹）"
      : "Verification email has been sent, please check your inbox (including spam folder)";

    console.log(`✅ 重新发送验证邮件请求处理完成`);
    console.log(`   邮箱: ${trimmedEmail}`);
    console.log(`   语言: ${targetLanguage}`);
    console.log(`   重定向URL: ${targetDomain}`);

    return new Response(
      JSON.stringify({
        status: 'ok',
        message: successMessage,
        success: true
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    console.error(`💥 发生未处理的异常:`);
    console.error(`   错误类型:`, err.constructor?.name || "未知");
    console.error(`   错误消息:`, err.message);
    console.error(`   错误详情:`, err);

    const targetLanguage = detectLanguageFromHeaders(req.headers);
    const errorMessage = targetLanguage === 'zh-CN'
      ? "发送验证邮件时发生错误，请稍后重试"
      : "An error occurred while sending verification email, please try again later";

    return new Response(
      JSON.stringify({
        error: 'internal_error',
        message: errorMessage,
        detail: String(err)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
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

/**
 * 获取客户端IP
 */
function getClientIP(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  const xRealIP = req.headers.get("x-real-ip");

  if (xff) {
    return xff.split(",")[0].trim();
  }

  if (xRealIP) {
    return xRealIP;
  }

  return null;
}