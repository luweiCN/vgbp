import React, { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/hooks/useI18n';

interface VersionInfo {
  version: string;
  buildTime: string;
  environment: string;
  gitCommit?: string;
}

interface VersionDisplayProps {
  showDetails: boolean;
  onShowDetailsChange: (show: boolean) => void;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({
  showDetails,
  onShowDetailsChange
}) => {
  const { t } = useI18n();
  const [version, setVersion] = useState<VersionInfo | null>(null);

  useEffect(() => {
    // 从 /version.json 获取版本信息
    fetch('/version.json')
      .then(res => {
        if (!res.ok) {
          return {
            version: '0.0.0',
            buildTime: new Date().toISOString(),
            environment: import.meta.env.MODE,
            gitCommit: undefined
          };
        }
        return res.json();
      })
      .then(data => setVersion(data))
      .catch(() => {
        setVersion({
          version: '0.0.0',
          buildTime: new Date().toISOString(),
          environment: import.meta.env.MODE,
          gitCommit: undefined
        });
      });
  }, []);

  if (!version) return null;

  // 获取环境显示文本
  const getEnvironmentText = () => {
    switch (version.environment) {
      case 'production':
        return '';
      case 'development':
        return t('ui.version.environment.development');
      default:
        return version.environment;
    }
  };

  // 获取环境颜色
  const getEnvironmentColor = () => {
    switch (version.environment) {
      case 'production':
        return '';
      case 'development':
        return 'text-blue-500';
      default:
        return 'text-orange-500';
    }
  };

  const envText = getEnvironmentText();

  return (
    <>
      <div className="flex items-center justify-center h-12 max-w-[1400px] mx-auto px-4">
        <div className="inline-block text-xs text-zinc-500 opacity-50 hover:opacity-100 transition-opacity cursor-pointer select-none">
          <div
            data-version-button
            onClick={() => onShowDetailsChange(!showDetails)}
          >
            <span>v{version.version}</span>
            {envText && (
              <span className={`ml-1 ${getEnvironmentColor()}`}>({envText})</span>
            )}
          </div>
        </div>
      </div>

      {/* Version modal without background overlay */}
      {showDetails && (
        <div
          data-version-modal
          className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-black border border-zinc-700 rounded-lg p-4 shadow-2xl text-xs min-w-[280px] z-[70]"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-white">{t('ui.version.label.version')}</span>
              <span className="text-zinc-300">{version.version}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="font-medium text-white">{t('ui.version.label.buildTime')}</span>
              <span className="text-zinc-300 text-right">
                {new Date(version.buildTime).toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-white">{t('ui.version.label.environment')}</span>
              <span className={getEnvironmentColor()}>
                {version.environment === 'production' ? t('ui.version.environment.production') : getEnvironmentText()}
              </span>
            </div>
            {version.gitCommit && (
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">{t('ui.version.label.commit')}</span>
                <span className="font-mono text-zinc-300 text-right">{version.gitCommit}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};