import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Globe } from 'lucide-react';
import { useSafeI18n } from './useSafeI18n';
import { LanguageSelectorProps } from '../types';
import { useIsSmallScreen } from '@/hooks/useIsMobile';

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
  const [isOpen, setIsOpen] = useState(false);

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

  // 查找当前选中的语言
  const currentLang = supportedLanguages.find(lang => lang.code === language);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectLanguage = (langCode: 'zh-CN' | 'en-US') => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  // 点击外部关闭下拉
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target instanceof Element && !event.target.closest('.language-selector')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // 加载状态
  if (!isLanguageReady) {
    return (
      <div className={containerClasses}>
        <div className="w-auto min-w-[140px] px-4 py-2.5 text-gray-400 text-sm border border-gray-600 rounded-xl text-center">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={`language-selector relative ${containerClasses}`}>
      {/* 触发按钮 */}
      <button
        onClick={handleToggleDropdown}
        className={`
          w-auto min-w-[140px] px-4 py-2.5
          bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl
          border border-white/20 dark:border-slate-700/50 rounded-xl
          text-sm text-gray-700 dark:text-gray-200 cursor-pointer
          transition-all duration-200 ease-out
          hover:bg-white dark:hover:bg-slate-800/95
          hover:shadow-lg hover:shadow-black/5
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          flex items-center justify-between
          ${position === 'sidebar' ? 'w-full' : ''}
        `}
        aria-label="选择语言 / Select Language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2">
          {showFlag && currentLang && (
            <span className="text-base leading-none">{currentLang.flag}</span>
          )}
          <span className="font-medium truncate">
            {showNativeName ? currentLang?.nativeName : currentLang?.name}
          </span>
        </div>

        {/* 下拉箭头 */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`
            flex-shrink-0 transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
          `}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 下拉选项 */}
      {isOpen && (
        <div className={`
          absolute top-full left-0 mt-1
          bg-slate-50 dark:bg-slate-800
          border border-slate-200 dark:border-slate-700
          rounded-lg shadow-lg
          overflow-hidden z-50
          min-w-[160px]
        `}>
          {supportedLanguages.map((lang) => (
            <div
              key={lang.code}
              role="option"
              aria-selected={language === lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className={`
                px-3 py-2 cursor-pointer
                transition-colors duration-150
                flex items-center gap-2
                ${language === lang.code
                  ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }
              `}
            >
              {showFlag && (
                <span className="text-sm">{lang.flag}</span>
              )}
              <span className="text-sm font-medium">
                {showNativeName ? lang.nativeName : lang.name}
              </span>
              {language === lang.code && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-auto">
                  <path
                    d="M13.5 4.5L6 12L2.5 8.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * LanguageToggle - 语言切换组件
 * 现代化的语言切换设计，符合主流UI风格
 */
export const LanguageToggle = ({ className = '' }) => {
  const { language, setLanguage, isReady, translate: t } = useSafeI18n();
  const [buttonPosition, setButtonPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [isHovering, setIsHovering] = React.useState(false);
  const isMobile = useIsSmallScreen();
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const languages = [
    { code: 'zh-CN', name: '中文', flag: '中' },
    { code: 'en-US', name: 'English', flag: 'EN' }
  ];

  const currentIndex = languages.findIndex(lang => lang.code === language);
  const nextIndex = (currentIndex + 1) % languages.length;
  const currentLang = languages[currentIndex];
  const nextLang = languages[nextIndex];

  
  // 更新按钮位置
  useEffect(() => {
    if (buttonRef.current && isReady) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2
      });
    }

    const handleUpdatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setButtonPosition({
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2
        });
      }
    };

    // 监听滚动和窗口大小变化
    window.addEventListener('scroll', handleUpdatePosition);
    window.addEventListener('resize', handleUpdatePosition);

    return () => {
      window.removeEventListener('scroll', handleUpdatePosition);
      window.removeEventListener('resize', handleUpdatePosition);
    };
  }, [isReady]);

  if (!isReady) {
    return (
      <div className={`w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Tooltip 组件
  const Tooltip = () => {
    if (!buttonPosition || isMobile) return null;

    return ReactDOM.createPortal(
      <div
        className="fixed px-3 py-1.5 bg-zinc-900 text-xs text-zinc-200 rounded-lg transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl border border-zinc-700/50"
        style={{
          zIndex: 999999,
          top: `${buttonPosition.top}px`,
          left: `${buttonPosition.left}px`,
          transform: `translateX(-50%) ${isHovering ? 'translateY(0)' : 'translateY(4px)'}`,
          opacity: isHovering ? 1 : 0
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-zinc-400 text-xs">{t('ui.common.switchLanguage')}</span>
          <span className="flex items-center gap-2">
            <span>{currentLang.flag}</span>
            <span className="text-zinc-400">→</span>
            <span>{nextLang.flag}</span>
            <span>{nextLang.name}</span>
          </span>
        </div>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45 border-t border-l border-zinc-700/50"></div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <button
        ref={buttonRef}
        className={`
          relative flex items-center justify-center gap-1 w-auto h-[38px] px-3 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 cursor-pointer hover:bg-slate-800/80 transition-all duration-200
          ${className}
        `}
        onClick={async () => {
          try {
            await setLanguage(nextLang.code as any);
          } catch (error) {
            console.error('Failed to switch language:', error);
          }
        }}
        onMouseEnter={() => !isMobile && setIsHovering(true)}
        onMouseLeave={() => !isMobile && setIsHovering(false)}
        title={isMobile ? undefined : `切换到 ${nextLang.name}`}
        aria-label={`当前语言: ${currentLang.name}, 点击切换到 ${nextLang.name}`}
      >
        {/* 图标和文字容器 */}
        <div className="flex items-center gap-1">
          {/* Lucide React 地球图标 */}
          <Globe
            className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors duration-200"
            strokeWidth={1.5}
          />

          {/* 语言文字 */}
          <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors duration-200">
            {currentLang.code === 'zh-CN' ? '中' : 'EN'}
          </span>
        </div>
      </button>

      {/* 使用 Portal 渲染 Tooltip */}
      <Tooltip />
    </>
  );
};

export default LanguageSelector;