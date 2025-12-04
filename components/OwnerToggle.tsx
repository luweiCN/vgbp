/**
 * "我创建的"开关组件 - 紧凑型开关
 */

import React from 'react';

export interface OwnerToggleProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const OwnerToggle: React.FC<OwnerToggleProps> = ({
  isChecked,
  onChange,
  disabled = false,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 开关 */}
      <button
        onClick={() => !disabled && onChange(!isChecked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isChecked
            ? 'bg-blue-600'
            : 'bg-zinc-700'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>

      {/* 标签 */}
      <span className="text-sm text-zinc-300 whitespace-nowrap ml-2">
        只看我的
      </span>
    </div>
  );
};

export default OwnerToggle;