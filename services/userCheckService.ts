import { supabase } from './supabase';

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
}

// 发送确认邮件响应接口
export interface SendConfirmationResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * 检查邮箱注册状态
 * 调用 Edge Functions 来检查邮箱是否已经注册以及验证状态
 */
export const checkEmailStatus = async (email: string): Promise<CheckEmailResponse> => {
  try {
    console.log('🔍 尝试调用 Edge Function: check-email');

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
    return { status: 'not_registered' };
  }
};

/**
 * 重发确认邮件
 * 调用 Edge Functions 重新发送验证邮件
 */
export const resendConfirmationEmail = async (email: string, domain?: string): Promise<ResendConfirmationResponse> => {
  try {
    // 如果没有传入domain，使用当前页面的origin
    const currentDomain = domain || (typeof window !== 'undefined' ? window.location.origin : '');

    console.log('🔍 尝试调用 Edge Function: resend-confirmation');
    console.log('📧 Email:', email, '🌐 Domain:', currentDomain);

    const { data, error } = await supabase.functions.invoke('resend-confirmation', {
      body: {
        email,
        domain: currentDomain
      }
    });

    if (error) {
      // 检查是否是函数不存在错误
      if (error.message?.includes('NOT_FOUND') || error.message?.includes('Requested function was not found')) {
        return {
          success: false,
          message: '邮件服务暂时不可用，请稍后重试'
        };
      }
      console.error('重发确认邮件失败:', error);
      return {
        success: false,
        message: error.message || '重发确认邮件失败'
      };
    }

    console.log('✅ 重发确认邮件调用成功:', data);
    return data || { success: false, message: '未收到服务器响应' };
  } catch (error: any) {
    console.error('resendConfirmationEmail error:', error);
    return {
      success: false,
      message: '邮件服务暂时不可用，请稍后重试'
    };
  }
};

/**
 * 发送确认邮件
 * 使用 Supabase Edge Function 发送确认邮件
 */
export const sendConfirmationEmail = async (email: string, confirmationLink?: string): Promise<SendConfirmationResponse> => {
  try {
    console.log('🔍 尝试调用 Edge Function: send-confirmation');
    const { data, error } = await supabase.functions.invoke('send-confirmation', {
      body: { email, confirmationLink }
    });

    if (error) {
      console.error('发送确认邮件失败:', error);
      return {
        success: false,
        message: error.message || '发送确认邮件失败',
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
    return {
      success: false,
      message: error.message || '发送确认邮件失败',
      error: error.message
    };
  }
};