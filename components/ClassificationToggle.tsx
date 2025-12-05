import React, { useState, useEffect } from 'react';
import { ClassificationMode } from '@/data/heroes';
import { useI18n } from '@/i18n/hooks/useI18n';
import { useDefaultIsMobile } from '@/hooks/useIsMobile';

interface ClassificationToggleProps {
  classificationMode: ClassificationMode;
  onChange: (mode: ClassificationMode) => void;
  onSave: (mode: ClassificationMode) => void;
  onShowInfo: () => void;
}

const getModeText = (mode: ClassificationMode, t: (key: string) => string) => {
  switch (mode) {
    case ClassificationMode.OFFICIAL:
      return t('ui.components.classificationToggle.official');
    case ClassificationMode.COMMON:
      return t('ui.components.classificationToggle.common');
    case ClassificationMode.FLEX:
      return t('ui.components.classificationToggle.flex');
    default:
      return t('ui.components.classificationToggle.official');
  }
};

const ClassificationToggle: React.FC<ClassificationToggleProps> = ({
  classificationMode,
  onChange,
  onSave,
  onShowInfo,
}) => {
  const { t } = useI18n();
  const isMobile = useDefaultIsMobile();

  
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
          <span>{getModeText(classificationMode, t)}</span>
        </button>
        <button
          onClick={onShowInfo}
          className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
          title={t('ui.components.classificationToggle.infoTitle')}
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
      <span className="text-xs text-zinc-400 hidden sm:inline">{t('ui.components.classificationToggle.heroClassification')}</span>
      <button
        onClick={onShowInfo}
        className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
        title={t('ui.components.classificationToggle.infoTitle')}
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
          title={t('ui.components.classificationToggle.officialDesc')}
        >
          {t('ui.components.classificationToggle.officialShort')}
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
          title={t('ui.components.classificationToggle.commonDesc')}
        >
          {t('ui.components.classificationToggle.commonShort')}
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
          title={t('ui.components.classificationToggle.flexDesc')}
        >
          {t('ui.components.classificationToggle.flexShort')}
        </button>
      </div>
    </div>
  );
};

export default ClassificationToggle;