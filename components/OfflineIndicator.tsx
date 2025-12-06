import React, { useState, useEffect } from "react";
import { useSafeI18n } from "@/i18n/components/useSafeI18n";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

export const OfflineIndicator: React.FC = () => {
  const { translate: t } = useSafeI18n();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRefresh, setShowRefresh] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRefresh(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      // 离线时显示刷新按钮，提示用户手动刷新
      setShowRefresh(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  // 在线时不显示
  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-600/95 backdrop-blur-sm text-white px-4 py-2 flex items-center justify-between gap-4 z-50">
      <div className="flex items-center gap-2">
        <Icon icon={WifiOff} preset="sm" />
        <span className="text-sm font-medium">
          {t("ui.components.pwa.offline.title")}
        </span>
        <span className="text-xs opacity-90 hidden sm:inline">
          {t("ui.components.pwa.offline.description")}
        </span>
      </div>

      {showRefresh && (
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
        >
          <Icon icon={RefreshCw} preset="xs" />
          {t("ui.components.pwa.update.refresh")}
        </button>
      )}
    </div>
  );
};

