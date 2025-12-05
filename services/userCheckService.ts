import { supabase, handleSupabaseError } from './supabase';
import { SupabaseErrorTranslator } from '@/services/translateSupabaseError';
import { i18nService } from '@/i18n/services/i18n.service';

// 邮箱状态响应接口
export interface CheckEmailResponse {
  status: 'not_registered' | 'registered_unverified' | 'registered_verified';
  message?: string;
  userId?: string;
}

// 重发确认邮件响应接口
export interface ResendConfirmationResponse {
  success: boolean;
  message: string;
  confirmationLink?: string;
  cooldownSeconds?: number;
}

// 发送确认邮件响应接口
export interface SendConfirmationResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * 处理Edge Function错误并返回本地化消息
 */
const handleEdgeFunctionError = (error: any): string => {
  // 检查是否是函数不存在错误
  if (error.message?.includes('NOT_FOUND') || error.message?.includes('Requested function was not found')) {
    return '邮件服务暂时不可用，请稍后重试';
  }

  // 如果是Supabase错误，使用翻译器
  if (SupabaseErrorTranslator.isSupabaseError(error)) {
    return SupabaseErrorTranslator.translate(error);
  }

  // 检查是否有特定的错误消息
  if (typeof error.message === 'string') {
    // 网络相关错误
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return '网络连接错误，请检查您的网络连接';
    }

    // 超时错误
    if (error.message.includes('timeout')) {
      return '请求超时，请稍后重试';
    }

    // 服务器错误
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return '服务器错误，请稍后重试';
    }

    // 429 错误（请求过于频繁）
    if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
      return '请求过于频繁，请稍后再试';
    }
  }

  // 默认错误消息
  return error.message || '操作失败，请稍后重试';
};

/**
 * 检查邮箱注册状态
 * 调用 Edge Functions 来检查邮箱是否已经注册以及验证状态
 */
export const checkEmailStatus = async (email: string): Promise<CheckEmailResponse> => {
  try {

    const { data, error } = await supabase.functions.invoke('check-email', {
      body: { email }
    });

    if (error) {
      // 检查是否是函数不存在错误
      if (error.message?.includes('NOT_FOUND') || error.message?.includes('Requested function was not found')) {
        console.warn('⚠️ Edge Functions 尚未部署，跳过邮箱状态检查');
        return { status: 'not_registered' };
      }

      console.error('检查邮箱状态失败:', error);
      throw error;
    }

    console.log('✅ Edge Function 调用成功，返回数据:', data);
    return data || { status: 'not_registered' };
  } catch (error: any) {
    console.error('checkEmailStatus error:', error);

    // 如果 Edge Function 不可用，默认返回未注册状态
    return {
      status: 'not_registered',
      message: '邮箱状态检查服务暂时不可用'
    };
  }
};

/**
 * 重发确认邮件
 * 调用 Edge Functions 重新发送验证邮件
 */
export const resendConfirmationEmail = async (email: string, domain?: string): Promise<ResendConfirmationResponse> => {
  try {
    // 注意：domain 参数已不再需要，send-email-hook 会自动处理重定向
    // 保留 domain 参数是为了向后兼容，但不再传递给 Edge Function

    // 获取当前语言
    const currentLanguage = i18nService.getCurrentLanguage();

    const { data, error } = await supabase.functions.invoke('resend-confirmation', {
      body: {
        email,
        language: currentLanguage,
        redirectUrl: window.location.origin
      }
    });

    if (error) {
      const errorMessage = handleEdgeFunctionError(error);
      console.error('重发确认邮件失败:', error);
      return {
        success: false,
        message: errorMessage
      };
    }

    console.log('✅ 重发确认邮件调用成功:', data);
    return data || {
      success: false,
      message: '未收到服务器响应'
    };
  } catch (error: any) {
    console.error('resendConfirmationEmail error:', error);
    const errorMessage = handleEdgeFunctionError(error);
    return {
      success: false,
      message: errorMessage
    };
  }
};

/**
 * 发送确认邮件
 * 使用 Supabase Edge Function 发送确认邮件
 */
export const sendConfirmationEmail = async (email: string, confirmationLink?: string): Promise<SendConfirmationResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation', {
      body: { email, confirmationLink }
    });

    if (error) {
      const errorMessage = handleEdgeFunctionError(error);
      console.error('发送确认邮件失败:', error);
      return {
        success: false,
        message: errorMessage,
        error: error.message
      };
    }

    console.log('✅ 发送确认邮件调用成功:', data);
    return {
      success: true,
      message: '确认邮件发送成功'
    };
  } catch (error: any) {
    console.error('sendConfirmationEmail error:', error);
    const errorMessage = handleEdgeFunctionError(error);
    return {
      success: false,
      message: errorMessage,
      error: error.message
    };
  }
};

/**
 * 统一处理Supabase错误并返回本地化消息
 * 可以在其他服务中复用
 */
export const handleServiceError = (error: any): string => {
  // 使用 supabase.ts 中的错误处理函数
  return handleSupabaseError(error);
};

/**
 * 检查是否是网络错误
 */
export const isNetworkError = (error: any): boolean => {
  return error.name === 'NetworkError' ||
         error.message?.includes('fetch') ||
         error.message?.includes('network') ||
         error.code === 'NETWORK_ERROR';
};

/**
 * 检查是否是超时错误
 */
export const isTimeoutError = (error: any): boolean => {
  return error.name === 'TimeoutError' ||
         error.message?.includes('timeout') ||
         error.code === 'TIMEOUT';
};

/**
 * 检查是否是服务器错误
 */
export const isServerError = (error: any): boolean => {
  return error.status >= 500 ||
         error.message?.includes('500') ||
         error.message?.includes('Internal Server Error');
};