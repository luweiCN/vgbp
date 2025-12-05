/**
 * Supabase Edge Function: Send Email Hook handler
 *
 * 功能：
 * - 接收 Supabase Send Email Hook 请求
 * - 根据用户语言偏好发送多语言邮件
 * - 复用现有的 EmailService 发送邮件
 * - 支持 GeoIP 语言推断
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { EmailService } from "../shared/email-service.ts";
import { EmailI18nUtils } from "../shared/i18n-utils.ts";

// 环境变量配置
const REDIRECT_BASE_URL = Deno.env.get("REDIRECT_BASE_URL") ?? "https://vgbp.luwei.host";
const SEND_EMAIL_HOOK_SECRET = Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "";
const FALLBACK_LANG = Deno.env.get("FALLBACK_LANG") ?? "zh";

// GeoIP API
const GEOIP_API = Deno.env.get("GEOIP_API") ?? "https://ipapi.co";

// 支持的邮件类型映射到我们的模板名称
const EMAIL_TYPE_MAP: Record<string, 'confirmation' | 'resend'> = {
  'signup': 'confirmation',
  'confirmation': 'confirmation',
  'magiclink': 'confirmation',
  'invite': 'confirmation',
  'recovery': 'resend',
  'email_change': 'resend',
  'reset': 'resend'
};

// 工具函数：安全获取对象属性
function safeGet(obj: any, path: string[], fallback: any = undefined) {
  return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj) ?? fallback;
}

// 验证 Hook 签名
async function verifyHookSignature(req: Request, bodyText: string): Promise<boolean> {
  try {
    // 获取完整的 secret（包含 v1,whsec_ 前缀）
    const fullSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
    if (!fullSecret) {
      console.warn("SEND_EMAIL_HOOK_SECRET not set");
      return false;
    }

    // 提取 <standard-base64-secret> 部分
    const hookSecret = fullSecret.replace('v1,whsec_', '');

    // 提取所有相关的 headers
    const headers = {
      'webhook-id': req.headers.get('webhook-id'),
      'webhook-timestamp': req.headers.get('webhook-timestamp'),
      'webhook-signature': req.headers.get('webhook-signature')
    };

    // 验证必需的 headers
    if (!headers['webhook-id'] || !headers['webhook-timestamp'] || !headers['webhook-signature']) {
      console.warn("Missing required webhook headers");
      return false;
    }

    console.log('🔐 验证 Webhook 签名...');
    console.log(`   Webhook ID: ${headers['webhook-id']}`);
    console.log(`   Timestamp: ${headers['webhook-timestamp']}`);

    // 使用 Standard Webhooks 库验证
    const wh = new Webhook(hookSecret);
    const verifiedData = wh.verify(bodyText, headers);

    console.log('✅ Webhook 签名验证成功');
    return true;

  } catch (err) {
    console.error("❌ Webhook 签名验证失败:");
    console.error(`   错误类型: ${err.constructor?.name || 'Unknown'}`);
    console.error(`   错误消息: ${err.message}`);

    // 记录收到的 headers 以便调试
    console.error(`   webhook-id: ${req.headers.get('webhook-id') || 'missing'}`);
    console.error(`   webhook-timestamp: ${req.headers.get('webhook-timestamp') || 'missing'}`);
    console.error(`   webhook-signature: ${req.headers.get('webhook-signature')?.substring(0, 50) || 'missing'}...`);

    return false;
  }
}

// 根据 IP 推断语言
async function guessLanguageFromIP(ip: string | null): Promise<'zh-CN' | 'en-US'> {
  if (!ip) return FALLBACK_LANG as 'zh-CN' | 'en-US';

  try {
    const resp = await fetch(`${GEOIP_API}/${ip}/json/`, {
      headers: { Accept: "application/json" }
    });

    if (!resp.ok) return FALLBACK_LANG as 'zh-CN' | 'en-US';

    const data = await resp.json();
    const countryCode = (data.country_code || "").toString().toUpperCase();

    // 中文地区
    const chineseCountries = ["CN", "TW", "HK", "MO", "SG"];
    if (chineseCountries.includes(countryCode)) {
      return "zh-CN";
    }

    // 英文地区
    const englishCountries = ["US", "GB", "AU", "CA", "NZ", "IE"];
    if (englishCountries.includes(countryCode)) {
      return "en-US";
    }

    return FALLBACK_LANG as 'zh-CN' | 'en-US';
  } catch (err) {
    console.warn("GeoIP lookup failed:", err);
    return FALLBACK_LANG as 'zh-CN' | 'en-US';
  }
}

// 获取客户端 IP
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

serve(async (req: Request) => {
  console.log(`🚀 Send Email Hook 函数开始执行...`);
  console.log(`   请求方法: ${req.method}`);
  console.log(`   请求URL: ${req.url}`);

  // 打印所有请求头
  console.log(`📋 所有请求头:`);
  req.headers.forEach((value, key) => {
    console.log(`   ${key}: ${value}`);
  });

  // 只处理 POST 请求
  if (req.method !== "POST") {
    console.log(`❌ 只接受POST请求，当前请求: ${req.method}`);
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    console.log(`📥 正在读取请求体...`);
    const rawBody = await req.text();
    console.log(`   请求体长度: ${rawBody.length} 字符`);
    console.log(`📄 完整请求体:`);
    console.log(rawBody);

    // 验证签名
    console.log(`🔐 正在验证Hook签名...`);
    const okSig = await verifyHookSignature(req, rawBody);
    if (!okSig) {
      console.warn(`❌ Hook签名验证失败`);
      console.warn(`   Signature Header: ${req.headers.get("x-supabase-hook-signature") || req.headers.get("x-hook-signature") || "无"}`);
      return new Response(JSON.stringify({ error: "invalid_signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log(`✅ Hook签名验证成功`);

    console.log(`📋 正在解析请求载荷...`);
    const payload = JSON.parse(rawBody);
    console.log(`   载荷键值:`, Object.keys(payload));

    // 提取邮件信息
    console.log(`📧 正在提取邮件信息...`);
    const email = safeGet(payload, ["email"])
               ?? safeGet(payload, ["user", "email"])
               ?? safeGet(payload, ["record", "email"]);

    const user = safeGet(payload, ["user"]) ?? safeGet(payload, ["record"]);
    const email_data = safeGet(payload, ["email_data"], {});
    const action = (email_data.email_action_type ?? email_data.type ?? "signup").toString().toLowerCase();

    console.log(`   收件人邮箱: ${email || "未找到"}`);
    console.log(`   邮件动作类型: ${action}`);
    console.log(`   用户对象键值:`, user ? Object.keys(user) : "无用户对象");

    if (!email) {
      console.warn(`❌ 未在载荷中找到收件人邮箱`);
      console.warn(`   载荷结构:`, JSON.stringify(payload, null, 2));
      return new Response(JSON.stringify({ error: "no_recipient" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 确定语言偏好
    console.log(`🌍 正在确定语言偏好...`);
    let language: 'zh-CN' | 'en-US';

    // 调试：打印完整的用户元数据
    console.log(`   完整用户对象:`, JSON.stringify(user, null, 2));
    const userMetadata = safeGet(user, ["user_metadata"]);
    console.log(`   用户元数据:`, JSON.stringify(userMetadata, null, 2));

    // 1. 从用户元数据获取
    const userLang = safeGet(user, ["user_metadata", "language"]);
    console.log(`   提取的语言字段: ${userLang}`);
    if (userLang && ['zh-CN', 'en-US'].includes(userLang)) {
      language = userLang as 'zh-CN' | 'en-US';
      console.log(`   从用户元数据获取语言: ${language}`);
    } else {
      // 2. 从 IP 推断
      console.log(`   用户元数据中无语言信息，尝试从IP推断...`);
      const ip = getClientIP(req);
      console.log(`   客户端IP: ${ip || "无法获取"}`);
      language = await guessLanguageFromIP(ip);
      console.log(`   IP推断语言: ${language}`);
    }

    console.log(`📮 准备发送邮件:`);
    console.log(`   收件人: ${email}`);
    console.log(`   语言: ${language}`);
    console.log(`   动作: ${action}`);

    // 生成确认链接
    console.log(`🔗 正在生成确认链接...`);
    let confirmationLink: string;

    // 优先使用 Supabase 生成的标准 action_link
    if (email_data.action_link) {
      // action_link 已经包含了正确的重定向URL
      confirmationLink = email_data.action_link;
      console.log(`   使用Supabase生成的action_link: ${confirmationLink}`);
    } else {
      // 如果没有 action_link，则构建标准验证链接
      const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, '') || "https://sxkozhhlhvxdnwirbubw.supabase.co";
      const redirectTo = safeGet(payload, ["email_data", "redirect_to"]) || REDIRECT_BASE_URL;

      // 从 token_hash 中提取实际 token（去掉前缀）
      const token = email_data.token_hash || email_data.token;

      if (token) {
        confirmationLink = `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(token)}&type=${encodeURIComponent(action)}&redirect_to=${encodeURIComponent(redirectTo)}`;
        console.log(`   构建标准验证链接: ${confirmationLink}`);
      } else {
        // 最后的回退
        confirmationLink = redirectTo;
        console.log(`   使用基础重定向URL: ${confirmationLink}`);
      }
    }

    // 映射到我们的邮件模板类型
    const templateType = EMAIL_TYPE_MAP[action] ?? 'confirmation';
    console.log(`   映射到模板类型: ${templateType}`);

    // 使用现有的 EmailService 发送邮件
    console.log(`📤 调用EmailService发送邮件...`);
    const result = await EmailService.sendMultilingualEmail(
      email,
      templateType,
      { confirmationLink },
      language
    );

    if (result.success) {
      console.log(`✅ 邮件发送成功！收件人: ${email}`);
      return new Response(JSON.stringify({ status: "sent" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      console.error(`❌ 发送邮件失败！收件人: ${email}`);
      console.error(`   失败原因: ${result.message}`);
      return new Response(JSON.stringify({ error: "send_failed", message: result.message }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (err) {
    console.error(`💥 send-email-hook发生未处理异常:`);
    console.error(`   错误类型:`, err.constructor.name);
    console.error(`   错误消息:`, err.message);
    console.error(`   错误堆栈:`, err.stack);
    return new Response(JSON.stringify({
      error: "internal_error",
      detail: String(err)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});