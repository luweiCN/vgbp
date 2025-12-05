import { i18nService } from '@/i18n/services/i18n.service';
import { SupabaseErrorTranslator } from '../../services/translateSupabaseError';

/**
 * API响应接口定义
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  details?: any;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: any;
}

/**
 * API响应助手类
 * 提供标准化的本地化API响应格式
 */
export class ApiResponseHelper {
  /**
   * 创建成功响应
   * @param data 响应数据
   * @param messageKey 翻译键，如果不提供则使用默认成功消息
   * @param messageParams 消息参数，用于插值
   */
  static async success<T = any>(
    data?: T,
    messageKey?: string,
    messageParams?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const message = messageKey
      ? await i18nService.translate(messageKey, messageParams)
      : await i18nService.translate('api.success.operationSuccessful');

    return {
      success: true,
      data,
      message
    };
  }

  /**
   * 创建错误响应
   * @param errorKey 错误键或错误对象
   * @param details 错误详情
   */
  static async error(
    errorKey: string | any,
    details?: any
  ): Promise<ApiError> {
    // 如果是Supabase错误对象，使用翻译器
    if (typeof errorKey === 'object' && SupabaseErrorTranslator.isSupabaseError(errorKey)) {
      const message = SupabaseErrorTranslator.translate(errorKey);
      return {
        success: false,
        error: 'supabase_error',
        message,
        details
      };
    }

    // 对于字符串错误键，尝试翻译
    if (typeof errorKey === 'string') {
      // 首先尝试翻译为API错误
      const message = await i18nService.translate(`api.errors.${errorKey}`);

      // 如果翻译键不存在，返回原始键
      if (message === `api.errors.${errorKey}`) {
        return {
          success: false,
          error: errorKey,
          message: errorKey,
          details
        };
      }

      return {
        success: false,
        error: errorKey,
        message,
        details
      };
    }

    // 其他情况，返回通用错误
    const message = await i18nService.translate('api.errors.unknownError');
    return {
      success: false,
      error: 'unknown_error',
      message,
      details: errorKey
    };
  }

  /**
   * 创建带有自定义消息的响应
   * @param success 是否成功
   * @param message 自定义消息
   * @param data 数据（可选）
   * @param error 错误键（可选）
   */
  static async custom<T = any>(
    success: boolean,
    message: string,
    data?: T,
    error?: string
  ): Promise<ApiResponse<T>> {
    return {
      success,
      data,
      message,
      error
    };
  }

  /**
   * 创建带有验证错误的响应
   * @param errors 验证错误对象
   */
  static async validationError(
    errors: Record<string, string[]>
  ): Promise<ApiError> {
    const message = await i18nService.translate('api.errors.validationFailed');
    return {
      success: false,
      error: 'validation_failed',
      message,
      details: { validationErrors: errors }
    };
  }

  /**
   * 创建权限不足的响应
   */
  static async permissionDenied(): Promise<ApiError> {
    return this.error('permissionDenied');
  }

  /**
   * 创建未找到的响应
   */
  static async notFound(resource?: string): Promise<ApiError> {
    const errorKey = resource ? `${resource}NotFound` : 'notFound';
    return this.error(errorKey);
  }

  /**
   * 创建服务器错误的响应
   */
  static async serverError(details?: any): Promise<ApiError> {
    return this.error('serverError', details);
  }

  /**
   * 创建网络错误的响应
   */
  static async networkError(): Promise<ApiError> {
    return this.error('networkError');
  }

  /**
   * 创建认证过期的响应
   */
  static async sessionExpired(): Promise<ApiError> {
    return this.error('sessionExpired');
  }

  /**
   * 创建请求过于频繁的响应
   * @param cooldownSeconds 冷却时间（秒）
   */
  static async rateLimitExceeded(cooldownSeconds?: number): Promise<ApiError> {
    const message = cooldownSeconds
      ? await i18nService.translate('api.errors.tooManyRequests')
      : await i18nService.translate('api.errors.rateLimitExceeded');

    return {
      success: false,
      error: 'rate_limit_exceeded',
      message,
      details: { cooldownSeconds }
    };
  }

  /**
   * 处理API异常并返回标准错误响应
   * @param error 异常对象
   */
  static async handleException(error: any): Promise<ApiError> {
    console.error('API Exception:', error);

    // Supabase错误
    if (SupabaseErrorTranslator.isSupabaseError(error)) {
      return this.error(error);
    }

    // 网络错误
    if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
      return this.networkError();
    }

    // 超时错误
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return this.error('authTimeout');
    }

    // 验证错误
    if (error.name === 'ValidationError') {
      return this.validationError(error.details || {});
    }

    // 其他错误
    return this.serverError({
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }

  /**
   * 创建分页响应
   * @param data 数据列表
   * @param page 当前页
   * @param pageSize 每页大小
   * @param total 总数
   */
  static async paginated<T = any>(
    data: T[],
    page: number,
    pageSize: number,
    total: number
  ): Promise<ApiResponse<{
    items: T[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    const totalPages = Math.ceil(total / pageSize);
    const pagination = {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return this.success({
      items: data,
      pagination
    });
  }
}