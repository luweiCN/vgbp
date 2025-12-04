// 多语言支持的类型定义
import React from 'react';

export type Language = 'zh-CN' | 'en-US';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export interface LanguagePackMeta {
  language: Language;
  version: string;
  lastUpdated: string;
}

// 翻译键值对结构
export interface Translations {
  // UI组件文本
  ui: {
    common: Record<string, string>;
    components: Record<string, Record<string, string>>;
  };

  // 操作按钮
  actions: Record<string, string>;

  // 状态信息
  status: Record<string, string>;

  // 角色分类
  roles: Record<string, string>;

  // 表单标签
  forms: Record<string, {
    label: string;
    placeholder?: string;
    help?: string;
    validation?: Record<string, string>;
  }>;

  // 动态消息
  messages: Record<string, string>;
}

// 完整语言包结构
export interface LanguagePack {
  meta: LanguagePackMeta;
  translations: Translations;
}

// 英雄本地化数据结构
export interface HeroLocalizationData {
  [heroId: string]: {
    displayName?: string;
    nickname?: string;
    description?: string;
    roleDescription?: string;
    tips?: string[];
  };
}

// 缓存统计信息
export interface CacheStats {
  memoryCache: {
    size: number;
    languages: Language[];
  };
  localStorageCache: {
    size: number;
    languages: Language[];
  };
}

// 搜索相关的类型
export interface SearchSuggestion {
  text: string;
  type: 'name' | 'nickname' | 'role';
  heroId?: string;
}

export interface HighlightRange {
  start: number;
  end: number;
  text: string;
}

export interface SearchIndex {
  [key: string]: Set<string>;
}

// 本地化的英雄信息
export interface LocalizedHeroInfo {
  displayName: string;
  nickname: string | null;
  description?: string;
  roleDescription?: string;
}

// I18n服务接口
export interface I18nServiceInterface {
  // 语言管理
  getCurrentLanguage(): Language;
  setLanguage(language: Language): Promise<void>;
  getSupportedLanguages(): Language[];
  getLanguageConfig(language: Language): LanguageConfig;

  // 翻译功能
  translate(key: string, params?: Record<string, any>): string | React.ReactNode;
  translatePlural(key: string, count: number, params?: Record<string, any>): string;

  // 语言包管理
  loadLanguagePack(language: Language): Promise<LanguagePack>;
  preloadLanguagePack(language: Language): Promise<void>;

  // 缓存管理
  clearCache(): void;
  getCacheStats(): CacheStats;
}

// 英雄本地化服务接口
export interface HeroLocalizationServiceInterface {
  // 英雄名称本地化
  getHeroDisplayName(hero: any, language: Language): string;
  getHeroNickname(hero: any, language: Language): string | null;

  // 英雄描述本地化
  getHeroRoleDescription(role: any, language: Language): string;
  getHeroAttackTypeDescription(attackType: any, language: Language): string;

  // 昵称处理逻辑
  shouldShowNickname(hero: any, language: Language): boolean;
  getLocalizedHeroInfo(hero: any, language: Language): LocalizedHeroInfo;
}

// 多语言搜索服务接口
export interface MultilingualSearchServiceInterface {
  // 搜索功能
  searchHeroes(heroes: any[], query: string, language: Language): any[];
  searchWithSuggestions(query: string, language: Language): SearchSuggestion[];

  // 搜索索引
  buildSearchIndex(heroes: any[], language: Language): SearchIndex;
  updateSearchIndex(heroes: any[], language: Language): void;

  // 搜索优化
  getSearchHighlights(text: string, query: string): HighlightRange[];
  rankSearchResults(results: any[], query: string, language: Language): any[];
}

// React Context类型
export interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  translate: (key: string, params?: Record<string, any>) => string;
  isLoading: boolean;
  isReady: boolean;
}

export interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
  fallbackLanguage?: Language;
}

// LanguageSelector组件Props
export interface LanguageSelectorProps {
  className?: string;
  showFlag?: boolean;
  showNativeName?: boolean;
  position?: 'header' | 'footer' | 'sidebar';
}

// useI18n Hook返回类型
export interface UseI18nReturn {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string, params?: Record<string, any>) => string;
  tc: (key: string, count: number, params?: Record<string, any>) => string;
  isLanguageReady: boolean;
  formatMessage: (key: string, values?: Record<string, React.ReactNode>) => React.ReactNode;
}