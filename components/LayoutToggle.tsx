import React, { useState } from 'react';

interface LayoutToggleProps {
  layoutMode: "auto" | "3" | "4" | "5";
  onChange: (mode: "auto" | "3" | "4" | "5") => void;
}

const LayoutToggle: React.FC<LayoutToggleProps> = ({ layoutMode, onChange }) => {
  const getLayoutText = (mode: "auto" | "3" | "4" | "5") => {
    switch (mode) {
      case "auto":
        return "自动";
      case "3":
        return "3栏";
      case "4":
        return "4栏";
      case "5":
        return "5栏";
      default:
        return "自动";
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
      title="点击切换布局模式"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
      <span>{getLayoutText(layoutMode)}</span>
    </button>
  );
};

export default LayoutToggle;