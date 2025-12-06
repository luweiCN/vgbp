/**
 * 房间搜索组件
 * 复用RoomPage的搜索UI设计，支持响应式布局
 */

import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/i18n/hooks/useI18n';
import { Search, X } from 'lucide-react';
import { Icon } from './ui/Icon';

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
  const { t } = useI18n();
  const [isFocused, setIsFocused] = useState(false);
  const [searchInput, setSearchInput] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // 使用翻译的占位符，如果没有传入自定义占位符
  const searchPlaceholder = placeholder || t('ui.components.roomSearchBox.placeholder');

  // 同步外部value到本地状态
  useEffect(() => {
    setSearchInput(value);
  }, [value]);

  // 处理输入变化（只更新本地状态）
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newValue = e.target.value;
    setSearchInput(newValue);
    onChange?.(newValue);
  };

  // 处理搜索
  const handleSearch = () => {
    if (disabled) return;
    onSearch(searchInput);
  };

  // 处理清除
  const handleClear = () => {
    if (disabled) return;
    setSearchInput('');
    onChange?.('');
    onClear();
    inputRef.current?.focus();
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      handleClear();
    } else if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      {/* Desktop Version */}
      <div className={`hidden md:flex flex-grow justify-center max-w-md ${className}`}>
        <div className={`
          flex items-center w-full bg-zinc-800/50 border border-zinc-800 rounded-lg px-3 py-1.5 gap-2
          transition-all duration-200
          ${isFocused ? 'border-blue-500/50 bg-zinc-800/70' : 'border-zinc-800'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${loading ? 'border-blue-500/50' : ''}
        `}>
          {/* Search Icon */}
          {!loading ? (
            <Icon icon={Search} preset="sm" className="text-zinc-400" />
          ) : (
            // Loading Spinner
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500 flex-shrink-0" />
          )}

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            maxLength={30}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-400 outline-none border-none focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
          />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={disabled}
            className="h-6 px-2 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title={t('ui.components.roomSearchBox.searchButtonTitle')}
          >
            {t('ui.components.roomSearchBox.searchButton')}
          </button>


          {/* Clear Button */}
          {searchInput && !disabled && (
            <button
              onClick={handleClear}
              className="h-4 w-4 text-zinc-400 hover:text-zinc-200 transition-colors flex-shrink-0"
              title={t('ui.components.roomSearchBox.clearButtonTitle')}
            >
              <Icon icon={X} preset="sm" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Version */}
      <div className={`md:hidden ${className}`}>
        <div className={`
          flex items-center w-full bg-zinc-800/50 border border-zinc-800 rounded-lg px-3 py-1.5 gap-2
          transition-all duration-200
          ${isFocused ? 'border-blue-500/50 bg-zinc-800/70' : 'border-zinc-800'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${loading ? 'border-blue-500/50' : ''}
        `}>
          {/* Search Icon */}
          {!loading ? (
            <Icon icon={Search} preset="sm" className="text-zinc-400" />
          ) : (
            // Loading Spinner
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500 flex-shrink-0" />
          )}

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            maxLength={30}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-400 outline-none border-none focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
          />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={disabled}
            className="h-6 px-2 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title={t('ui.components.roomSearchBox.searchButtonTitle')}
          >
            {t('ui.components.roomSearchBox.searchButton')}
          </button>


          {/* Clear Button */}
          {searchInput && !disabled && (
            <button
              onClick={handleClear}
              className="h-4 w-4 text-zinc-400 hover:text-zinc-200 transition-colors flex-shrink-0"
              title={t('ui.components.roomSearchBox.clearButtonTitle')}
            >
              <Icon icon={X} preset="sm" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};