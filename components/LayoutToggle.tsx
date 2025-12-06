import React, { useState } from 'react';
import { useI18n } from '@/i18n/hooks/useI18n';
import { LayoutGrid } from 'lucide-react';
import { Icon } from './ui/Icon';

interface LayoutToggleProps {
  layoutMode: "auto" | "3" | "4" | "5";
  onChange: (mode: "auto" | "3" | "4" | "5") => void;
}

const LayoutToggle: React.FC<LayoutToggleProps> = ({ layoutMode, onChange }) => {
  const { t } = useI18n();

  const getLayoutText = (mode: "auto" | "3" | "4" | "5") => {
    switch (mode) {
      case "auto":
        return t('ui.components.layoutToggle.auto');
      case "3":
        return t('ui.components.layoutToggle.three');
      case "4":
        return t('ui.components.layoutToggle.four');
      case "5":
        return t('ui.components.layoutToggle.five');
      default:
        return t('ui.components.layoutToggle.auto');
    }
  };

  const handleToggle = () => {
    const modes: ("auto" | "3" | "4" | "5")[] = ["auto", "3", "4", "5"];
    const currentIndex = modes.indexOf(layoutMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onChange(modes[nextIndex]);
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
      title={t('ui.components.layoutToggle.title')}
    >
      <Icon icon={LayoutGrid} preset="sm" />
      <span>{getLayoutText(layoutMode)}</span>
    </button>
  );
};

export default LayoutToggle;