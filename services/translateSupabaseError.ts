import { translateError, SupportedLanguage } from 'supabase-error-translator-js';
import { i18nService } from '@/i18n/services/i18n.service';

/**
 * Supabase错误翻译适配器
 * 封装第三方包功能，与项目i18n系统集成
 */
export class SupabaseErrorTranslator {
  /**
   * 翻译Supabase错误消息
   * @param error Supabase错误对象
   * @param language 可选的语言代码，如果不提供则使用当前界面语言
   * @returns 翻译后的错误消息
   */
  static translate(error: any, language?: 'zh-CN' | 'en-US'): string {
    try {
      // 获取目标语言，默认使用当前界面语言
      const targetLanguage = language || i18nService.getCurrentLanguage();

      // 映射到包支持的语言代码
      const packageLanguage = this.mapToPackageLanguage(targetLanguage);

      // 使用第三方包进行翻译
      const translated = translateError(error, packageLanguage);

      // 如果翻译结果为空或与原文相同，提供回退
      if (!translated || translated === error?.message) {
        return this.getFallbackMessage(error, targetLanguage);
      }

      return translated;
    } catch (e) {
      // 第三方包失败，使用回退机制
      return this.getFallbackMessage(error, language || 'zh-CN');
    }
  }

  /**
   * 获取支持的语言列表
   */
  static getSupportedLanguages(): SupportedLanguage[] {
    // 从第三方包获取支持的语言
    return [
      { code: 'en', name: 'English' },
      { code: 'zh', name: '中文' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
      { code: 'ja', name: '日本語' },
      { code: 'ko', name: '한국어' },
      { code: 'pt', name: 'Português' },
      { code: 'ru', name: 'Русский' }
    ];
  }

  /**
   * 将项目语言代码映射到包支持的语言代码
   */
  private static mapToPackageLanguage(projectLanguage: 'zh-CN' | 'en-US'): string {
    switch (projectLanguage) {
      case 'zh-CN':
        return 'zh';
      case 'en-US':
        return 'en';
      default:
        return 'zh'; // 默认使用中文
    }
  }

  /**
   * 获取回退错误消息
   */
  private static getFallbackMessage(error: any, language: 'zh-CN' | 'en-US'): string {
    const errorMessage = error?.message || '';
    const errorCode = error?.code || '';

    // 根据错误消息内容提供基本翻译
    const lowerMessage = errorMessage.toLowerCase();

    if (language === 'zh-CN') {
      if (lowerMessage.includes('invalid login credentials')) {
        return '邮箱或密码错误';
      }
      if (lowerMessage.includes('email not confirmed')) {
        return '请先验证您的邮箱地址';
      }
      if (lowerMessage.includes('user_not_found')) {
        return '用户不存在';
      }
      if (lowerMessage.includes('weak_password')) {
        return '密码强度不够，请使用更复杂的密码';
      }
      if (lowerMessage.includes('email already registered')) {
        return '该邮箱已被注册';
      }
      if (lowerMessage.includes('too many requests')) {
        return '请求过于频繁，请稍后再试';
      }
      if (lowerMessage.includes('session expired')) {
        return '会话已过期，请重新登录';
      }
      // 返回原始错误消息
      return errorMessage;
    } else {
      if (lowerMessage.includes('invalid login credentials')) {
        return 'Invalid email or password';
      }
      if (lowerMessage.includes('email not confirmed')) {
        return 'Please verify your email address first';
      }
      if (lowerMessage.includes('user_not_found')) {
        return 'User not found';
      }
      if (lowerMessage.includes('weak_password')) {
        return 'Password is too weak, please use a stronger password';
      }
      if (lowerMessage.includes('email already registered')) {
        return 'This email is already registered';
      }
      if (lowerMessage.includes('too many requests')) {
        return 'Too many requests, please try again later';
      }
      if (lowerMessage.includes('session expired')) {
        return 'Session expired, please log in again';
      }
      // 返回原始错误消息
      return errorMessage;
    }
  }

  /**
   * 检查是否为Supabase错误
   */
  static isSupabaseError(error: any): boolean {
    return error && (
      typeof error === 'object' && (
        'message' in error ||
        'code' in error ||
        'error_description' in error
      )
    );
  }
}