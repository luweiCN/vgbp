import React, { useState, useEffect } from 'react';
import { ClassificationMode } from '../data/heroes';

interface ClassificationToggleProps {
  classificationMode: ClassificationMode;
  onChange: (mode: ClassificationMode) => void;
  onSave: (mode: ClassificationMode) => void;
  onShowInfo: () => void;
}

const getModeText = (mode: ClassificationMode) => {
  switch (mode) {
    case ClassificationMode.OFFICIAL:
      return "官方定位";
    case ClassificationMode.COMMON:
      return "常见位置";
    case ClassificationMode.FLEX:
      return "灵活位置";
    default:
      return "官方定位";
  }
};

const ClassificationToggle: React.FC<ClassificationToggleProps> = ({
  classificationMode,
  onChange,
  onSave,
  onShowInfo,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // 检测屏幕大小
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md断点是768px
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleCompactToggle = () => {
    const nextMode = classificationMode === ClassificationMode.OFFICIAL
      ? ClassificationMode.COMMON
      : classificationMode === ClassificationMode.COMMON
      ? ClassificationMode.FLEX
      : ClassificationMode.OFFICIAL;
    onChange(nextMode);
    onSave(nextMode);
  };

  if (isMobile) {
    // 移动端紧凑样式 - 轮换切换
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleCompactToggle}
          className="flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>{getModeText(classificationMode)}</span>
        </button>
        <button
          onClick={onShowInfo}
          className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="分类说明"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    );
  }

  // 桌面端完整样式 - 三个独立按钮
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-400 hidden sm:inline">英雄分类:</span>
      <button
        onClick={onShowInfo}
        className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
        title="分类说明"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      <div className="flex items-center gap-1 bg-zinc-800 rounded-full p-1">
        <button
          onClick={() => {
            onChange(ClassificationMode.OFFICIAL);
            onSave(ClassificationMode.OFFICIAL);
          }}
          className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
            classificationMode === ClassificationMode.OFFICIAL
              ? "bg-blue-600 text-white"
              : "text-zinc-400 hover:text-white hover:bg-zinc-700"
          }`}
          title="按官方定位分类"
        >
          官方
        </button>
        <button
          onClick={() => {
            onChange(ClassificationMode.COMMON);
            onSave(ClassificationMode.COMMON);
          }}
          className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
            classificationMode === ClassificationMode.COMMON
              ? "bg-green-600 text-white"
              : "text-zinc-400 hover:text-white hover:bg-zinc-700"
          }`}
          title="按玩家常见位置分类"
        >
          常见
        </button>
        <button
          onClick={() => {
            onChange(ClassificationMode.FLEX);
            onSave(ClassificationMode.FLEX);
          }}
          className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
            classificationMode === ClassificationMode.FLEX
              ? "bg-orange-600 text-white"
              : "text-zinc-400 hover:text-white hover:bg-zinc-700"
          }`}
          title="按理论上可以打的位置分类"
        >
          灵活
        </button>
      </div>
    </div>
  );
};

export default ClassificationToggle;