import React from 'react';
import { useI18n } from '@/i18n/hooks/useI18n';
import { BuildInfo } from '@/types/version';

const buildInfo: BuildInfo = __BUILD_INFO__;

interface VersionDisplayProps {
  showDetails: boolean;
  onShowDetailsChange: (show: boolean) => void;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({
  showDetails,
  onShowDetailsChange
}) => {
  const { t } = useI18n();

  // 获取环境显示文本
  const getEnvironmentText = () => {
    switch (buildInfo.environment) {
      case 'production':
        return '';
      case 'development':
        return t('ui.buildInfo.environment.development');
      default:
        return buildInfo.environment;
    }
  };

  // 获取环境颜色
  const getEnvironmentColor = () => {
    switch (buildInfo.environment) {
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
            <span>v{buildInfo.version}</span>
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
              <span className="text-zinc-300">{buildInfo.version}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="font-medium text-white">{t('ui.version.label.buildTime')}</span>
              <span className="text-zinc-300 text-right">
                {new Date(buildInfo.buildTime).toLocaleString('zh-CN', {
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
                {buildInfo.environment === 'production' ? t('ui.version.environment.production') : getEnvironmentText()}
              </span>
            </div>
            {buildInfo.gitCommit && (
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">{t('ui.version.label.commit')}</span>
                <span className="font-mono text-zinc-300 text-right">{buildInfo.gitCommit}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};