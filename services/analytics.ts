import { trackEvent } from '@aptabase/react';

/**
 * Aptabase Analytics 事件追踪服务
 *
 * 使用 Aptabase SDK 追踪用户行为和应用使用情况
 * 注意：Aptabase 是隐私优先的分析工具，所有事件都需要手动触发
 */

export const analytics = {
  // 页面访问追踪
  pageView: (page: string) => {
    trackEvent('page_view', { page });
  },

  // 房间相关事件
  roomCreated: () => {
    trackEvent('room_created');
  },

  roomJoined: (roomId: string) => {
    trackEvent('room_joined', { room_id: roomId });
  },

  localModeStarted: () => {
    trackEvent('local_mode_started');
  },

  // 英雄选择事件
  heroSelected: (heroId: string, heroName: string) => {
    trackEvent('hero_selected', {
      hero_id: heroId,
      hero_name: heroName
    });
  },

  heroDeselected: (heroId: string) => {
    trackEvent('hero_deselected', { hero_id: heroId });
  },

  // AI 功能相关
  aiAdviceRequested: (heroCount: number) => {
    trackEvent('ai_advice_requested', { hero_count: heroCount });
  },

  aiAdviceReceived: (responseTime: number) => {
    trackEvent('ai_advice_received', { response_time_ms: responseTime });
  },

  aiAdviceShown: () => {
    trackEvent('ai_advice_shown');
  },

  // 用户行为事件
  languageChanged: (fromLang: string, toLang: string) => {
    trackEvent('language_changed', {
      from_language: fromLang,
      to_language: toLang
    });
  },

  shareClicked: (method: string) => {
    trackEvent('share_clicked', { method });
  },

  copyCodeClicked: () => {
    trackEvent('copy_code_clicked');
  },

  // PWA 相关事件
  pwaInstallPromptShown: () => {
    trackEvent('pwa_install_prompt_shown');
  },

  pwaInstallAccepted: () => {
    trackEvent('pwa_install_accepted');
  },

  pwaInstallDismissed: () => {
    trackEvent('pwa_install_dismissed');
  },

  pwaInstalled: () => {
    trackEvent('pwa_installed');
  },

  // 应用生命周期
  appStarted: () => {
    trackEvent('app_started');
  },

  appFocused: () => {
    trackEvent('app_focused');
  },

  appBlurred: () => {
    trackEvent('app_blurred');
  },

  // 错误追踪（可选）
  errorOccurred: (errorType: string, errorMessage?: string) => {
    trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage?.substring(0, 100) // 限制长度
    });
  }
};

// 导出类型供其他文件使用
export type AnalyticsService = typeof analytics;