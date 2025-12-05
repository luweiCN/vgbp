import { useState, useCallback } from 'react';
import { ClassificationMode } from '../data/heroes';

// 房间设置接口
export interface RoomSettings {
  layoutMode: "auto" | "3" | "4" | "5";
  hideSelected: boolean;
  isCompactLayout: boolean;
  classificationMode: ClassificationMode;
}

// 本地存储的key
const ROOM_SETTINGS_KEY = 'vainglory-draft-room-settings';

// 默认设置
const DEFAULT_SETTINGS: RoomSettings = {
  layoutMode: 'auto',
  hideSelected: false,
  isCompactLayout: false,
  classificationMode: ClassificationMode.OFFICIAL,
};

export const useRoomSettings = () => {
  // 从localStorage加载设置
  const loadSettings = useCallback((): RoomSettings => {
    try {
      const stored = localStorage.getItem(ROOM_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 确保所有字段都有值，如果有缺失则使用默认值
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
        };
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load room settings from localStorage:', error);
      return DEFAULT_SETTINGS;
    }
  }, []);

  // 初始化所有设置状态
  const [layoutMode, setLayoutMode] = useState<"auto" | "3" | "4" | "5">(() => loadSettings().layoutMode);
  const [hideSelected, setHideSelected] = useState<boolean>(() => loadSettings().hideSelected);
  const [isCompactLayout, setIsCompactLayout] = useState<boolean>(() => loadSettings().isCompactLayout);
  const [classificationMode, setClassificationMode] = useState<ClassificationMode>(() => loadSettings().classificationMode);

  // 保存设置到localStorage
  const saveSettings = useCallback((settings: Partial<RoomSettings>) => {
    try {
      const currentSettings: RoomSettings = {
        layoutMode,
        hideSelected,
        isCompactLayout,
        classificationMode,
        ...settings,
      };
      localStorage.setItem(ROOM_SETTINGS_KEY, JSON.stringify(currentSettings));
    } catch (error) {
      console.error('Failed to save room settings to localStorage:', error);
    }
  }, [layoutMode, hideSelected, isCompactLayout, classificationMode]);

  // 更新各个设置的函数
  const updateLayoutMode = useCallback((newLayoutMode: "auto" | "3" | "4" | "5") => {
    setLayoutMode(newLayoutMode);
    saveSettings({ layoutMode: newLayoutMode });
  }, [saveSettings]);

  const updateHideSelected = useCallback((newHideSelected: boolean) => {
    setHideSelected(newHideSelected);
    saveSettings({ hideSelected: newHideSelected });
  }, [saveSettings]);

  const updateCompactLayout = useCallback((newCompactLayout: boolean) => {
    setIsCompactLayout(newCompactLayout);
    saveSettings({ isCompactLayout: newCompactLayout });
  }, [saveSettings]);

  const updateClassificationMode = useCallback((newClassificationMode: ClassificationMode) => {
    setClassificationMode(newClassificationMode);
    saveSettings({ classificationMode: newClassificationMode });
  }, [saveSettings]);

  // 重置所有设置为默认值
  const resetSettings = useCallback(() => {
    setLayoutMode(DEFAULT_SETTINGS.layoutMode);
    setHideSelected(DEFAULT_SETTINGS.hideSelected);
    setIsCompactLayout(DEFAULT_SETTINGS.isCompactLayout);
    setClassificationMode(DEFAULT_SETTINGS.classificationMode);
    saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  return {
    // 状态
    layoutMode,
    hideSelected,
    isCompactLayout,
    classificationMode,

    // 更新函数
    setLayoutMode: updateLayoutMode,
    setHideSelected: updateHideSelected,
    setIsCompactLayout: updateCompactLayout,
    setClassificationMode: updateClassificationMode,

    // 重置函数
    resetSettings,
  };
};