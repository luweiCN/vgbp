/**
 * 房间搜索组件
 * 复用RoomPage的搜索UI设计，支持响应式布局
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useI18n } from '@/i18n/hooks/useI18n';

export interface RoomSearchBoxProps {
  value: string;
  onChange?: (value: string) => void;
  onClear: () => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const RoomSearchBox: React.FC<RoomSearchBoxProps> = ({
  value,
  onChange,
  onClear,
  onSearch,
  placeholder,
  loading = false,
  disabled = false,
  className = "",
}) => {
  const { t, language } = useI18n();
  const [searchInput, setSearchInput] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // 使用翻译的占位符，如果没有传入自定义占位符
  const searchPlaceholder = placeholder || t('ui.components.roomSearchBox.placeholder');

  // 同步外部value变化
  useEffect(() => {
    setSearchInput(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchInput(newValue);
    onChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchInput);
    }
  };

  const handleClear = () => {
    setSearchInput('');
    onChange?.('');
    onClear();
  };

  return (
    <div className={`relative w-full max-w-xl mx-auto ${className}`}>
      <div className="relative">
        {/* 搜索图标 */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400 dark:text-gray-500"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M21 21l-5-5m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* 输入框 */}
        <input
          ref={inputRef}
          type="text"
          value={searchInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={searchPlaceholder}
          disabled={disabled || loading}
          className="block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-12 py-3 text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* 清除按钮 */}
        {searchInput && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled || loading}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('ui.components.roomSearchBox.clearButtonTitle')}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};