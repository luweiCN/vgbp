import React from 'react';
import {
  Language,
  LanguagePack,
  LanguageConfig,
  CacheStats,
  I18nServiceInterface
} from '../types';

// 支持的语言配置
const SUPPORTED_LANGUAGES: Record<Language, LanguageConfig> = {
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
};

class I18nService implements I18nServiceInterface {
  private currentLanguage: Language = 'zh-CN';
  private fallbackLanguage: Language = 'zh-CN';
  private memoryCache: Record<Language, LanguagePack | null> = {
    'zh-CN': null,
    'en-US': null
  };
  private isLoading: Record<Language, boolean> = {
    'zh-CN': false,
    'en-US': false
  };

  constructor() {
    this.initializeLanguage();
  }

  /**
   * 初始化语言设置
   */
  private initializeLanguage(): void {
    // 1. 尝试从localStorage获取用户偏好
    const savedLanguage = localStorage.getItem('i18n-language') as Language;
    if (savedLanguage && this.isSupportedLanguage(savedLanguage)) {
      this.currentLanguage = savedLanguage;
      console.log(`Using saved language: ${savedLanguage}`);
      return;
    }

    // 2. 尝试从浏览器语言检测
    const browserLanguage = this.detectBrowserLanguage();
    if (browserLanguage) {
      this.currentLanguage = browserLanguage;
      this.saveLanguagePreference(browserLanguage);
      console.log(`Using detected browser language: ${browserLanguage}`);
      return;
    }

    // 3. 使用默认语言
    this.currentLanguage = this.fallbackLanguage;
    console.log(`Using fallback language: ${this.fallbackLanguage}`);
  }

  /**
   * 检测浏览器语言
   */
  private detectBrowserLanguage(): Language | null {
    if (typeof navigator === 'undefined') return null;

    const browserLang = navigator.language || navigator.languages?.[0];

    if (!browserLang) return null;

    // 直接匹配
    if (browserLang === 'zh-CN' || browserLang === 'zh') return 'zh-CN';
    if (browserLang === 'en-US' || browserLang === 'en') return 'en-US';

    // 模糊匹配
    if (browserLang.startsWith('zh')) return 'zh-CN';
    if (browserLang.startsWith('en')) return 'en-US';

    return null;
  }

  /**
   * 检查语言是否支持
   */
  private isSupportedLanguage(language: string): language is Language {
    return Object.keys(SUPPORTED_LANGUAGES).includes(language);
  }

  /**
   * 保存语言偏好到localStorage
   */
  private saveLanguagePreference(language: Language): void {
    try {
      localStorage.setItem('i18n-language', language);
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  }

  /**
   * 从localStorage缓存加载语言包
   */
  private loadFromCache(language: Language): LanguagePack | null {
    try {
      const cached = localStorage.getItem(`i18n-${language}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn(`Failed to load cache for ${language}:`, error);
      return null;
    }
  }

  /**
   * 保存语言包到localStorage缓存
   */
  private saveToCache(language: Language, pack: LanguagePack): void {
    try {
      localStorage.setItem(`i18n-${language}`, JSON.stringify(pack));
    } catch (error) {
      console.warn(`Failed to save cache for ${language}:`, error);
    }
  }

  /**
   * 获取嵌套对象的值
   */
  private getNestedValue(obj: any, key: string): string | undefined {
    return key.split('.').reduce((current, keyPart) => {
      return current?.[keyPart];
    }, obj);
  }

  // ========== 公共方法实现 ==========

  /**
   * 获取当前语言
   */
  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * 设置语言
   */
  async setLanguage(language: Language): Promise<void> {
    if (!this.isSupportedLanguage(language)) {
      console.warn(`Unsupported language: ${language}`);
      return;
    }

    if (language === this.currentLanguage) {
      return; // 已经是当前语言
    }

    try {
      // 预加载语言包
      await this.preloadLanguagePack(language);

      // 更新当前语言
      this.currentLanguage = language;
      this.saveLanguagePreference(language);
    } catch (error) {
      console.error(`Failed to set language to ${language}:`, error);
      throw error;
    }
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages(): Language[] {
    return Object.keys(SUPPORTED_LANGUAGES) as Language[];
  }

  /**
   * 获取语言配置
   */
  getLanguageConfig(language: Language): LanguageConfig {
    return SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES[this.fallbackLanguage];
  }

  /**
   * 翻译文本
   */
  translate(key: string, params?: Record<string, any>): string | React.ReactNode {
    const pack = this.memoryCache[this.currentLanguage];
    if (!pack) {
      console.warn(`Language pack not loaded for ${this.currentLanguage}`);
      return key;
    }

    let translation = this.getNestedValue(pack.translations, key);

    // 如果在当前语言中找不到，尝试回退语言
    if (!translation && this.currentLanguage !== this.fallbackLanguage) {
      const fallbackPack = this.memoryCache[this.fallbackLanguage];
      translation = fallbackPack ? this.getNestedValue(fallbackPack.translations, key) : null;
    }

    // 如果仍然找不到，返回key本身
    if (!translation) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }

    // 参数化翻译
    if (params) {
      // 检查是否有React组件参数
      const hasReactParams = Object.values(params).some(param =>
        param && typeof param === 'object' && param.$$typeof
      );

      if (hasReactParams) {
        // 如果有React组件，需要特殊处理
        return this.translateWithReactComponents(translation, params);
      } else {
        // 纯字符串参数，使用原有逻辑
        return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
          return params[paramKey] !== undefined ? String(params[paramKey]) : match;
        });
      }
    }

    return translation;
  }

  /**
   * 支持React组件的翻译方法
   */
  private translateWithReactComponents(translation: string, params: Record<string, any>): React.ReactNode {
    // 将字符串按模板标记拆分为数组
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const regex = /\{\{(\w+)\}\}/g;

    while ((match = regex.exec(translation)) !== null) {
      // 添加前面的文本
      if (match.index > lastIndex) {
        parts.push(translation.slice(lastIndex, match.index));
      }

      // 添加参数值
      const paramKey = match[1];
      if (params[paramKey] !== undefined) {
        parts.push(params[paramKey]);
      } else {
        parts.push(match[0]);
      }

      lastIndex = regex.lastIndex;
    }

    // 添加最后的文本
    if (lastIndex < translation.length) {
      parts.push(translation.slice(lastIndex));
    }

    return parts;
  }

  /**
   * 复数形式翻译
   */
  translatePlural(key: string, count: number, params?: Record<string, any>): string {
    const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`;
    return this.translate(pluralKey, { ...params, count });
  }

  /**
   * 加载语言包
   */
  async loadLanguagePack(language: Language): Promise<LanguagePack> {
    // 1. 检查内存缓存
    if (this.memoryCache[language]) {
      return this.memoryCache[language]!;
    }

    // 2. 防止重复加载
    if (this.isLoading[language]) {
      // 等待加载完成
      while (this.isLoading[language]) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return this.memoryCache[language]!;
    }

    this.isLoading[language] = true;

    try {
      // 3. 始终从网络加载最新版本
      const response = await fetch(`/i18n/locales/${language}.json?${Date.now()}`);
      if (!response.ok) {
        console.error(`Failed to load language pack for ${language}: ${response.status}`);

        // 网络加载失败时，尝试使用 localStorage 缓存作为备份
        const cached = this.loadFromCache(language);
        if (cached) {
          this.memoryCache[language] = cached;
          this.isLoading[language] = false;
          return cached;
        }

        throw new Error(`Failed to load language pack: ${response.status}`);
      }

      const pack: LanguagePack = await response.json();

      // 4. 缓存结果到内存和 localStorage
      this.memoryCache[language] = pack;
      this.saveToCache(language, pack);

      this.isLoading[language] = false;
      return pack;
    } catch (error) {
      this.isLoading[language] = false;

      // 如果是fallback语言，抛出错误
      if (language === this.fallbackLanguage) {
        throw error;
      }

      // 尝试加载fallback语言
      console.warn(`Failed to load ${language}, falling back to ${this.fallbackLanguage}`);
      return this.loadLanguagePack(this.fallbackLanguage);
    }
  }

  /**
   * 预加载语言包
   */
  async preloadLanguagePack(language: Language): Promise<void> {
    await this.loadLanguagePack(language);
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    // 清理内存缓存
    this.memoryCache = {
      'zh-CN': null,
      'en-US': null
    };

    // 清理localStorage缓存
    try {
      Object.keys(SUPPORTED_LANGUAGES).forEach(language => {
        localStorage.removeItem(`i18n-${language}`);
      });
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): CacheStats {
    const memoryLanguages: Language[] = [];
    const localStorageLanguages: Language[] = [];

    Object.entries(this.memoryCache).forEach(([lang, pack]) => {
      if (pack) memoryLanguages.push(lang as Language);
    });

    try {
      Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
        if (localStorage.getItem(`i18n-${lang}`)) {
          localStorageLanguages.push(lang as Language);
        }
      });
    } catch (error) {
      console.warn('Failed to check localStorage cache:', error);
    }

    return {
      memoryCache: {
        size: memoryLanguages.length,
        languages: memoryLanguages
      },
      localStorageCache: {
        size: localStorageLanguages.length,
        languages: localStorageLanguages
      }
    };
  }
}

// 创建单例实例
export const i18nService = new I18nService();
export default i18nService;