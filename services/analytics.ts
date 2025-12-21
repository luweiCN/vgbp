import React from 'react';
import { useAptabase } from '@aptabase/react';

/**
 * Aptabase Analytics Hook
 *
 * 使用 Aptabase SDK 追踪用户行为和应用使用情况
 * 注意：Aptabase 是隐私优先的分析工具，所有事件都需要手动触发
 *
 * 这个 hook 返回一个包含所有分析函数的对象，必须在 AptabaseProvider 内部使用
 */

export interface AnalyticsService {
  // 页面访问追踪
  pageView: (page: string) => Promise<void>;

  // 房间相关事件
  roomCreated: () => Promise<void>;
  roomJoined: (roomId: string) => Promise<void>;
  localModeStarted: () => Promise<void>;

  // 英雄选择事件
  heroSelected: (heroId: string, heroName: string) => Promise<void>;
  heroDeselected: (heroId: string) => Promise<void>;

  // AI 功能相关
  aiAdviceRequested: (heroCount: number) => Promise<void>;
  aiAdviceReceived: (responseTime: number) => Promise<void>;
  aiAdviceShown: () => Promise<void>;

  // 用户行为事件
  languageChanged: (fromLang: string, toLang: string) => Promise<void>;
  shareClicked: (method: string) => Promise<void>;
  copyCodeClicked: () => Promise<void>;

  // PWA 相关事件
  pwaInstallPromptShown: () => Promise<void>;
  pwaInstallAccepted: () => Promise<void>;
  pwaInstallDismissed: () => Promise<void>;
  pwaInstalled: () => Promise<void>;

  // 应用生命周期
  appStarted: () => Promise<void>;
  appFocused: () => Promise<void>;
  appBlurred: () => Promise<void>;

  // 错误追踪（可选）
  errorOccurred: (errorType: string, errorMessage?: string) => Promise<void>;
}

export const useAnalytics = (): AnalyticsService => {
  const { trackEvent } = useAptabase();

  return {
    // 页面访问追踪
    pageView: async (page: string) => {
      await trackEvent('page_view', { page });
    },

    // 房间相关事件
    roomCreated: async () => {
      await trackEvent('room_created');
    },

    roomJoined: async (roomId: string) => {
      await trackEvent('room_joined', { room_id: roomId });
    },

    localModeStarted: async () => {
      await trackEvent('local_mode_started');
    },

    // 英雄选择事件
    heroSelected: async (heroId: string, heroName: string) => {
      await trackEvent('hero_selected', {
        hero_id: heroId,
        hero_name: heroName
      });
    },

    heroDeselected: async (heroId: string) => {
      await trackEvent('hero_deselected', { hero_id: heroId });
    },

    // AI 功能相关
    aiAdviceRequested: async (heroCount: number) => {
      await trackEvent('ai_advice_requested', { hero_count: heroCount });
    },

    aiAdviceReceived: async (responseTime: number) => {
      await trackEvent('ai_advice_received', { response_time_ms: responseTime });
    },

    aiAdviceShown: async () => {
      await trackEvent('ai_advice_shown');
    },

    // 用户行为事件
    languageChanged: async (fromLang: string, toLang: string) => {
      await trackEvent('language_changed', {
        from_language: fromLang,
        to_language: toLang
      });
    },

    shareClicked: async (method: string) => {
      await trackEvent('share_clicked', { method });
    },

    copyCodeClicked: async () => {
      await trackEvent('copy_code_clicked');
    },

    // PWA 相关事件
    pwaInstallPromptShown: async () => {
      await trackEvent('pwa_install_prompt_shown');
    },

    pwaInstallAccepted: async () => {
      await trackEvent('pwa_install_accepted');
    },

    pwaInstallDismissed: async () => {
      await trackEvent('pwa_install_dismissed');
    },

    pwaInstalled: async () => {
      await trackEvent('pwa_installed');
    },

    // 应用生命周期
    appStarted: async () => {
      await trackEvent('app_started');
    },

    appFocused: async () => {
      await trackEvent('app_focused');
    },

    appBlurred: async () => {
      await trackEvent('app_blurred');
    },

    // 错误追踪（可选）
    errorOccurred: async (errorType: string, errorMessage?: string) => {
      await trackEvent('error_occurred', {
        error_type: errorType,
        error_message: errorMessage?.substring(0, 100) // 限制长度
      });
    }
  };
};