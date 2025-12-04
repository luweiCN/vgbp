import { useContext } from 'react';
import { I18nContext } from './I18nProvider';
import { I18nContextValue } from '../types';

// 简单的fallback翻译数据
const fallbackTranslations = {
  'ui.common.loading': '加载中...',
  'ui.common.save': '保存',
  'actions.createRoom': '创建房间',
  'status.loading': '加载中...',
  'roles.Captain': '辅助'
};

/**
 * 安全的useI18n hook，带有fallback值
 * 防止在I18nProvider完全初始化之前调用时出现错误
 */
export const useSafeI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);

  if (context === undefined) {
    console.warn('⚠️ I18nContext is undefined, using fallback values');
    // 返回带有基本翻译功能的fallback值
    return {
      language: 'zh-CN',
      setLanguage: async () => {
        console.warn('I18n not initialized yet');
      },
      translate: (key: string) => {
        const translation = fallbackTranslations[key as keyof typeof fallbackTranslations];
        if (translation) {
          return translation;
        }
        console.warn(`Translation for "${key}" not available, using fallback`);
        return key;
      },
      isLoading: false,
      isReady: true
    };
  }

  return context;
};

export default useSafeI18n;