import { useCallback } from 'react';
import { useI18n as useI18nContext } from '../components/I18nProvider';
import { UseI18nReturn, Language } from '../types';

/**
 * Enhanced useI18n hook with additional utility functions
 */
export const useI18n = (): UseI18nReturn => {
  const context = useI18nContext();

  /**
   * 简化的翻译函数，使用别名 't'
   */
  const t = useCallback((key: string, params?: Record<string, any>): string => {
    return context.translate(key, params);
  }, [context.translate]);

  /**
   * 复数形式翻译函数，使用别名 'tc'
   */
  const tc = useCallback((key: string, count: number, params?: Record<string, any>): string => {
    const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`;
    return context.translate(pluralKey, { ...params, count });
  }, [context.translate]);

  /**
   * 格式化消息，支持React节点作为值
   */
  const formatMessage = useCallback((
    key: string,
    values?: Record<string, React.ReactNode>
  ): React.ReactNode => {
    const template = context.translate(key);

    if (!values) {
      return template;
    }

    // 简单的模板替换，支持React节点
    const parts = template.split(/(\{\{\w+\}\})/);

    return parts.map((part, index) => {
      const match = part.match(/^\{\{(\w+)\}\}$/);
      if (match) {
        const valueKey = match[1];
        return values[valueKey] !== undefined ? values[valueKey] : part;
      }
      return part;
    });
  }, [context.translate]);

  /**
   * 检查当前语言是否就绪
   */
  const isLanguageReady = context.isReady && !context.isLoading;

  return {
    language: context.language,
    setLanguage: context.setLanguage,
    t,
    tc,
    isLanguageReady,
    formatMessage
  };
};

/**
 * Hook to get language configuration
 */
export const useLanguageConfig = () => {
  const { language } = useI18nContext();
  const configs = {
    'zh-CN': {
      code: 'zh-CN',
      name: 'Chinese (Simplified)',
      nativeName: '简体中文',
      flag: '🇨🇳'
    },
    'en-US': {
      code: 'en-US',
      name: 'English (US)',
      nativeName: 'English',
      flag: '🇺🇸'
    }
  } as const;

  return configs[language] || configs['zh-CN'];
};

/**
 * Hook to check if current language is RTL (Right-to-Left)
 * 为将来支持RTL语言预留
 */
export const useIsRTL = (): boolean => {
  const { language } = useI18nContext();
  const rtlLanguages = ['ar', 'he', 'fa', 'ur']; // 阿拉伯语、希伯来语、波斯语、乌尔都语

  return rtlLanguages.some(rtlLang => language.startsWith(rtlLang));
};

/**
 * Hook to get text direction for current language
 */
export const useTextDirection = (): 'ltr' | 'rtl' => {
  const isRTL = useIsRTL();
  return isRTL ? 'rtl' : 'ltr';
};

export default useI18n;