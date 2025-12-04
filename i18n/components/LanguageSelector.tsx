import React from 'react';
import { useSafeI18n } from './useSafeI18n';
import { LanguageSelectorProps } from '../types';

/**
 * LanguageSelector组件 - 提供语言切换功能
 */
export const LanguageSelector = ({
  className = '',
  showFlag = true,
  showNativeName = true,
  position = 'header'
}: LanguageSelectorProps) => {
  const { language, setLanguage, isReady: isLanguageReady } = useSafeI18n();

  // 支持的语言列表
  const supportedLanguages = [
    {
      code: 'zh-CN' as const,
      flag: '🇨🇳',
      name: 'Chinese (Simplified)',
      nativeName: '简体中文'
    },
    {
      code: 'en-US' as const,
      flag: '🇺🇸',
      name: 'English (US)',
      nativeName: 'English'
    }
  ];

  /**
   * 处理语言切换
   */
  const handleLanguageChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value as 'zh-CN' | 'en-US';

    try {
      await setLanguage(newLanguage);
    } catch (error) {
      console.error('Failed to switch language:', error);
      // 这里可以添加错误处理，比如显示toast通知
    }
  };

  /**
   * 根据位置获取样式类
   */
  const getPositionClasses = (): string => {
    const baseClasses = 'relative inline-block';

    switch (position) {
      case 'header':
        return `${baseClasses} mx-2`;
      case 'footer':
        return `${baseClasses} my-2`;
      case 'sidebar':
        return `${baseClasses} my-2 w-full`;
      default:
        return baseClasses;
    }
  };

  const containerClasses = `${getPositionClasses()} ${className}`.trim();

  if (!isLanguageReady) {
    // 加载状态
    return (
      <div className={containerClasses}>
        <div className="px-3 py-2 text-gray-400 text-sm border border-gray-600 rounded-md min-w-[120px] text-center">
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <select
        value={language}
        onChange={handleLanguageChange}
        className={`peer appearance-none bg-transparent border border-gray-600 rounded-md px-3 pr-8 py-2 text-sm text-gray-100 cursor-pointer transition-all duration-200 min-w-[120px] hover:border-blue-400 hover:bg-blue-400/10 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 ${position === 'sidebar' ? 'w-full' : ''}`}
        aria-label="选择语言 / Select Language"
      >
        {supportedLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {showFlag && `${lang.flag} `}
            {showNativeName ? lang.nativeName : lang.name}
          </option>
        ))}
      </select>

      {/* 自定义下拉箭头 */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 transition-transform duration-200 peer-focus:rotate-180">
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

/**
 * ButtonStyleLanguageSelector - 按钮样式的语言选择器
 * 适用于需要更突出语言切换功能的场景
 */
interface ButtonStyleLanguageSelectorProps {
  className?: string;
  showFlag?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ButtonStyleLanguageSelector = ({
  className = '',
  showFlag = true,
  size = 'medium'
}: ButtonStyleLanguageSelectorProps) => {
  const { language, setLanguage, isReady: isLanguageReady } = useSafeI18n();

  const supportedLanguages = [
    {
      code: 'zh-CN' as const,
      flag: '🇨🇳',
      name: '简体中文'
    },
    {
      code: 'en-US' as const,
      flag: '🇺🇸',
      name: 'English'
    }
  ];

  const currentLang = supportedLanguages.find(lang => lang.code === language);

  if (!isLanguageReady || !currentLang) {
    return (
      <div className={className}>
        <div className="px-3 py-2 text-gray-400 text-sm border border-gray-600 rounded-md text-center">
          Loading...
        </div>
      </div>
    );
  }

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base'
  };

  return (
    <button
      className={`inline-flex items-center gap-1.5 bg-transparent border border-gray-600 rounded-md text-gray-100 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-blue-400/10 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 whitespace-nowrap ${sizeClasses[size]} ${className}`.trim()}
      onClick={async () => {
        const nextLanguage = language === 'zh-CN' ? 'en-US' : 'zh-CN';

        try {
          await setLanguage(nextLanguage);
        } catch (error) {
          console.error('Failed to switch language:', error);
        }
      }}
      title={`切换到 ${language === 'zh-CN' ? 'English' : '简体中文'}`}
      aria-label={`切换到 ${language === 'zh-CN' ? 'English' : '简体中文'}`}
    >
      {showFlag && <span className="text-base leading-none">{currentLang.flag}</span>}
      <span className="font-medium">{currentLang.name}</span>
      <span className="text-xs opacity-70 transition-opacity duration-200 group-hover:opacity-100">⇄</span>
    </button>
  );
};

export default LanguageSelector;