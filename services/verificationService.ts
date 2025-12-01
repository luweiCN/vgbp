import { supabase } from './supabase';

export interface VerificationResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * 验证服务
 * 处理验证码的发送和验证
 */
export const verificationService = {
  /**
   * 发送验证码
   */
  async sendVerificationCode(email: string): Promise<VerificationResponse> {
    try {
      console.log('🔍 尝试调用 Edge Function: send-verification-code');
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { email }
      });

      if (error) {
        console.error('发送验证码失败:', error);
        return {
          success: false,
          message: error.message || '发送验证码失败'
        };
      }

      console.log('✅ 发送验证码调用成功:', data);
      return {
        success: true,
        message: '验证码已发送到您的邮箱',
        data
      };
    } catch (error: any) {
      console.error('sendVerificationCode error:', error);
      return {
        success: false,
        message: error.message || '发送验证码时发生错误'
      };
    }
  },

  /**
   * 验证验证码
   */
  async verifyCode(email: string, code: string): Promise<VerificationResponse> {
    try {
      console.log('🔍 尝试调用 Edge Function: verify-code');
      const { data, error } = await supabase.functions.invoke('verify-code', {
        body: { email, code }
      });

      if (error) {
        console.error('验证验证码失败:', error);
        return {
          success: false,
          message: error.message || '验证码验证失败'
        };
      }

      console.log('✅ 验证码调用成功:', data);
      return {
        success: true,
        message: '验证码验证成功',
        data
      };
    } catch (error: any) {
      console.error('verifyCode error:', error);
      return {
        success: false,
        message: error.message || '验证码验证时发生错误'
      };
    }
  }
};