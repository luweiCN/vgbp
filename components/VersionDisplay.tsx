import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/components/I18nProvider';

interface VersionInfo {
  version: string;
  buildTime: string;
  environment: string;
  gitCommit?: string;
}

export const VersionDisplay: React.FC = () => {
  const { t } = useI18n();
  const [version, setVersion] = useState<VersionInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // 从 /version.json 获取版本信息
    fetch('/version.json')
      .then(res => {
        if (!res.ok) {
          // 如果获取失败，返回默认值
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
        // 如果出错，尝试从 package.json 获取版本
        setVersion({
          version: '0.0.0', // 开发环境默认值
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
        return ''; // 生产环境不显示
      case 'development':
        return t('version.environment.development');
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
    <div className="fixed bottom-4 right-4 z-[100]">
      <div className="text-xs text-gray-500 dark:text-gray-400 opacity-50 hover:opacity-100 transition-opacity cursor-pointer select-none">
        <div onClick={() => setShowDetails(!showDetails)}>
          <span>v{version.version}</span>
          {envText && (
            <span className={`ml-1 ${getEnvironmentColor()}`}>({envText})</span>
          )}
        </div>

        {showDetails && (
          <div
            className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-xs min-w-[220px] z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <div>
                <span className="font-medium">{t('version.label.version')}:</span> {version.version}
              </div>
              <div>
                <span className="font-medium">{t('version.label.buildTime')}:</span>{' '}
                {new Date(version.buildTime).toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              <div>
                <span className="font-medium">{t('version.label.environment')}:</span>{' '}
                <span className={getEnvironmentColor()}>
                  {version.environment === 'production' ? t('version.environment.production') : getEnvironmentText()}
                </span>
              </div>
              {version.gitCommit && (
                <div className="font-mono">
                  <span className="font-medium">{t('version.label.commit')}:</span> {version.gitCommit}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};