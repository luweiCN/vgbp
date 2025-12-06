import React, { useEffect, useState } from 'react';
import { useSafeI18n } from '@/i18n/components/useSafeI18n';
import { X, Download, Smartphone } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const { translate: t } = useSafeI18n();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 检查是否已安装
    const checkIfInstalled = () => {
      // 检查是否在 PWA 模式下运行
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;

      if (isStandalone || isInWebAppiOS || isInWebAppChrome) {
        setIsInstalled(true);
        return;
      }

      // 检查是否已经提示过
      const hasPrompted = localStorage.getItem('pwa-install-prompted');
      if (!hasPrompted) {
        // 延迟显示安装提示，给用户一些时间使用应用
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 10000); // 10秒后显示
      }
    };

    checkIfInstalled();

    // 监听 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 监听 appinstalled 事件
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // 如果没有 deferred prompt，显示手动安装指南
      showInstallGuide();
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
        localStorage.setItem('pwa-install-prompted', 'true');
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA 安装提示失败:', error);
      showInstallGuide();
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-prompted', 'true');
  };

  const showInstallGuide = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let guideText = '';

    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      guideText = t('ui.components.pwa.installGuide.safari');
    } else if (userAgent.includes('chrome')) {
      guideText = t('ui.components.pwa.installGuide.chrome');
    } else if (userAgent.includes('firefox')) {
      guideText = t('ui.components.pwa.installGuide.firefox');
    } else {
      guideText = t('ui.components.pwa.installGuide.default');
    }

    alert(guideText);
  };

  // 如果已安装或不显示提示，则不渲染
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900/95 backdrop-blur-sm border border-blue-600/30 rounded-xl p-4 shadow-2xl transform transition-all duration-300 ease-in-out"
      style={{ zIndex: 999998 }}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <Icon icon={Smartphone} className="text-blue-400" />
          </div>
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm mb-1">
            {t('ui.components.pwa.installPrompt.title')}
          </h3>
          <p className="text-zinc-300 text-xs leading-relaxed">
            {t('ui.components.pwa.installPrompt.description')}
          </p>

          {/* 功能特点 */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
              {t('ui.components.pwa.installPrompt.features.offline')}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
              {t('ui.components.pwa.installPrompt.features.fast')}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
              {t('ui.components.pwa.installPrompt.features.native')}
            </div>
          </div>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-zinc-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
          aria-label={t('ui.common.close')}
        >
          <Icon icon={X} preset="sm" />
        </button>
      </div>

      {/* 安装按钮 */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Icon icon={Download} preset="sm" />
          {t('ui.components.pwa.installPrompt.install')}
        </button>
        <button
          onClick={handleDismiss}
          className="text-zinc-400 hover:text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
        >
          {t('ui.common.later')}
        </button>
      </div>
    </div>
  );
};