import React, { useEffect } from 'react';
import { useI18n } from '../i18n/components/I18nProvider';
import { useAnalytics } from '../services/analytics';

/**
 * 组件：追踪语言切换事件
 * 这个组件会监听语言变化并发送分析事件
 */
export const LanguageTracker: React.FC = () => {
  const { language } = useI18n();
  const analytics = useAnalytics();

  useEffect(() => {
    // 存储上一次的语言
    let previousLanguage = language;

    // 监听语言变化
    if (previousLanguage && language !== previousLanguage) {
      analytics.languageChanged(previousLanguage, language);
    }

    previousLanguage = language;
  }, [language, analytics]);

  // 这个组件不渲染任何内容
  return null;
};