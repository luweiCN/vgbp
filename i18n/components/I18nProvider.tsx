import React, { createContext, useContext, useState, useEffect, ReactNode, memo } from 'react';
import { I18nContextValue, I18nProviderProps, Language } from '../types';
import { i18nService } from '../services/i18n.service';

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);

/**
 * I18n Provider组件 - 为整个应用提供多语言支持
 */
export const I18nProvider = memo<I18nProviderProps>(({
  children,
  defaultLanguage = 'zh-CN',
  fallbackLanguage = 'zh-CN'
}) => {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [, forceUpdate] = useState({});

  /**
   * 设置语言并更新状态
   */
  const setLanguage = async (newLanguage: Language): Promise<void> => {
    if (newLanguage === language) return;

    try {
      setIsLoading(true);
      await i18nService.setLanguage(newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error('Failed to set language:', error);
      // 可以在这里添加错误处理，比如显示toast通知
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 翻译函数 - 确保语言包已加载
   */
  const translate = (key: string, params?: Record<string, any>): string => {
    // 如果还没准备好，返回key避免报错
    if (!isReady) {
      return key;
    }
    return i18nService.translate(key, params);
  };

  /**
   * 初始化i18n系统
   */
  useEffect(() => {
    const initializeI18n = async () => {
      try {
        setIsLoading(true);

        // 获取当前语言（可能从localStorage或浏览器语言检测得到）
        const currentLanguage = i18nService.getCurrentLanguage();
        setLanguageState(currentLanguage);

        // 预加载当前语言包
        await i18nService.loadLanguagePack(currentLanguage);

        // 预加载fallback语言包（异步，不阻塞）
        i18nService.preloadLanguagePack(fallbackLanguage).catch(error => {
          console.warn('Failed to preload fallback language:', error);
        });

        setIsReady(true);
        // 强制更新组件以确保翻译正确显示
        forceUpdate({});
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
        // 初始化失败，使用默认语言
        setLanguageState(defaultLanguage);
        setIsReady(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeI18n();
  }, [defaultLanguage, fallbackLanguage]);

  /**
   * 监听语言变化（跨标签页同步）
   */
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'i18n-language' && event.newValue) {
        const newLanguage = event.newValue as Language;
        if (newLanguage !== language && i18nService.getSupportedLanguages().includes(newLanguage)) {
          setLanguage(newLanguage);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [language]);

  // Context值
  const contextValue: I18nContextValue = {
    language,
    setLanguage,
    translate,
    isLoading,
    isReady
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
});

I18nProvider.displayName = 'I18nProvider';

/**
 * Hook to use the i18n context
 */
export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    // 提供一个默认的fallback值，而不是抛出错误
    console.warn('useI18n must be used within an I18nProvider, using fallback values');
    return {
      language: 'zh-CN',
      setLanguage: async () => {},
      translate: (key: string) => key,
      isLoading: true,
      isReady: false
    };
  }
  return context;
};

export default I18nProvider;