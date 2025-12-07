import React, { useState, useEffect } from 'react';

interface VersionInfo {
  version: string;
  buildTime: string;
  environment: string;
  gitCommit?: string;
}

export const VersionDisplay: React.FC = () => {
  const [version, setVersion] = useState<VersionInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // 优先使用构建时注入的版本信息
    if (import.meta.env.VITE_APP_VERSION) {
      setVersion({
        version: import.meta.env.VITE_APP_VERSION,
        buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
        environment: import.meta.env.MODE,
        gitCommit: import.meta.env.VITE_GIT_COMMIT
      });
    } else {
      // 开发环境下从 API 获取
      fetch('/version.json')
        .then(res => res.json())
        .then(data => setVersion(data))
        .catch(() => {
          // 如果获取失败，使用 package.json 中的版本
          setVersion({
            version: '0.0.7', // 可以从 package.json 动态导入
            buildTime: new Date().toISOString(),
            environment: import.meta.env.MODE
          });
        });
    }
  }, []);

  if (!version) return null;

  return (
    <div className="fixed bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 opacity-50 hover:opacity-100 transition-opacity cursor-pointer select-none">
      <div onClick={() => setShowDetails(!showDetails)}>
        v{version.version}
        {version.environment !== 'production' && (
          <span className="ml-1 text-orange-500">({version.environment})</span>
        )}
      </div>

      {showDetails && (
        <div className="absolute bottom-5 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 shadow-lg text-xs min-w-[200px] z-50">
          <div className="space-y-1">
            <div><span className="font-medium">版本:</span> {version.version}</div>
            <div><span className="font-medium">构建时间:</span> {new Date(version.buildTime).toLocaleString('zh-CN')}</div>
            <div><span className="font-medium">环境:</span> {version.environment}</div>
            {version.gitCommit && (
              <div><span className="font-medium">提交:</span> {version.gitCommit}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};