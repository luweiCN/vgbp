import React, { useEffect, useState } from 'react';
import { User, Zap, ChevronRight, X } from 'lucide-react';
import { getHeroAvatarUrl, getHeroById } from '@/data/heroes';
import { useI18n } from '@/i18n/hooks/useI18n';
import { Icon } from '@/components/ui/Icon';

interface HeroAvatarProps {
  heroId: string;
  borderColor: string;
  opacity?: number;
  style?: React.CSSProperties;
}

const HeroAvatar: React.FC<HeroAvatarProps> = ({ heroId, borderColor, opacity = 1, style }) => {
  const [imageError, setImageError] = useState(false);
  const hero = getHeroById(heroId);
  const { t } = useI18n();

  return (
    <div
      className={`w-10 h-10 rounded-lg border-2 ${borderColor} bg-gradient-to-br from-slate-600 to-slate-700 overflow-hidden relative shadow-sm flex items-center justify-center`}
      style={{ ...style, opacity }}
    >
      {imageError ? (
        <Icon icon={User} preset="xs" className="text-slate-400" />
      ) : (
        <img
          src={getHeroAvatarUrl(hero || { id: heroId })}
          alt={t('ui.components.heroAvatar.alt')}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};

interface HeroSelectionToastProps {
  message: string;
  addedHeroIds?: string[];
  removedHeroIds?: string[];
  duration?: number;
  onClose: () => void;
}

const HeroSelectionToast: React.FC<HeroSelectionToastProps> = ({
  message,
  addedHeroIds,
  removedHeroIds,
  duration = 4000,
  onClose
}) => {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 进入动画
    setIsVisible(true);

    // 自动关闭
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    onClose(); // 立即执行关闭，不延迟
    // 延迟重置状态，确保动画完成
    setTimeout(() => {
      setIsLeaving(false);
    }, 300);
  };

  const getAnimationClasses = () => {
    if (!isVisible) return 'translate-x-full opacity-0 scale-95';
    if (isLeaving) return 'translate-x-full opacity-0 scale-95';
    return 'translate-x-0 opacity-100 scale-100';
  };

  const hasChanges = (addedHeroIds && addedHeroIds.length > 0) || (removedHeroIds && removedHeroIds.length > 0);

  return (
    <>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      <div className={`
        bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
        border border-slate-700/50 
        rounded-2xl shadow-2xl backdrop-blur-xl
        p-5 min-w-[320px] max-w-[400px]
        transform transition-all duration-300 ease-in-out
        ${getAnimationClasses()}
        ${hasChanges ? 'ring-2 ring-blue-500/20 ring-offset-2 ring-offset-slate-900' : ''}
      `}>
        {/* 顶部装饰条 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl"></div>
        
        <div className="flex items-start gap-4">
          {/* 左侧图标区域 */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Icon icon={Zap} preset="sm" className="text-white" />
            </div>
          </div>

          {/* 中间内容区域 */}
          <div className="flex-1 min-w-0">
            {/* 消息文本 */}
            <div className="text-white font-medium text-sm leading-tight mb-3">
              {message}
            </div>

            {/* 英雄头像区域 */}
            {hasChanges && (
              <div className="flex items-center gap-3">
                {/* 新增英雄 */}
                {addedHeroIds && addedHeroIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-green-400 font-medium">{t('ui.components.heroSelectionToast.added')}</div>
                    <div className="flex items-center">
                      {addedHeroIds.slice(0, 4).map((heroId: string, index: number) => (
                        <HeroAvatar
                          key={heroId}
                          heroId={heroId}
                          borderColor="border-green-500"
                          style={{ marginLeft: index === 0 ? '0' : '2px' }}
                        />
                      ))}
                      {addedHeroIds.length > 4 && (
                        <div
                          className="w-10 h-10 rounded-lg border-2 border-green-500 bg-green-600 flex items-center justify-center text-xs text-white font-bold relative z-10 shadow-sm"
                          style={{ marginLeft: '2px' }}
                        >
                          +{addedHeroIds.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 分隔箭头 */}
                {addedHeroIds && addedHeroIds.length > 0 && removedHeroIds && removedHeroIds.length > 0 && (
                  <div className="text-slate-500">
                    <Icon icon={ChevronRight} preset="xs" />
                  </div>
                )}

                {/* 移除英雄 */}
                {removedHeroIds && removedHeroIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-red-400 font-medium">{t('ui.components.heroSelectionToast.removed')}</div>
                    <div className="flex items-center">
                      {removedHeroIds.slice(0, 4).map((heroId: string, index: number) => (
                        <HeroAvatar
                          key={heroId}
                          heroId={heroId}
                          borderColor="border-red-500"
                          opacity={0.6}
                          style={{ marginLeft: index === 0 ? '0' : '2px' }}
                        />
                      ))}
                      {removedHeroIds.length > 4 && (
                        <div
                          className="w-10 h-10 rounded-lg border-2 border-red-500 bg-red-600 flex items-center justify-center text-xs text-white font-bold relative z-10 opacity-60 shadow-sm"
                          style={{ marginLeft: '2px' }}
                        >
                          +{removedHeroIds.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 右侧关闭按钮 */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all duration-150 flex items-center justify-center"
            aria-label={t('ui.components.heroSelectionToast.close')}
            title={isLeaving ? t('ui.components.heroSelectionToast.closing') : t('ui.components.heroSelectionToast.close')}
            type="button"
            disabled={isLeaving} // 防止动画期间重复点击
          >
            <Icon icon={X} preset="xs" />
          </button>
        </div>

        {/* 底部进度条 */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-700 rounded-b-2xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-2xl"
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
    </>
  );
};

export default HeroSelectionToast;