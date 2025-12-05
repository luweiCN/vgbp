import React from 'react';
import { HeroRole } from '../constants';
import { Hero } from '../types';
import { getHeroAvatarUrl } from '../data/heroes';
import { useI18n } from '../i18n/hooks/useI18n';

interface SelectedHeroesModalProps {
  selectedHeroes: Set<string>;
  selectedHeroesGrouped: {
    [HeroRole.CAPTAIN]: Hero[];
    [HeroRole.JUNGLE]: Hero[];
    [HeroRole.CARRY]: Hero[];
  };
  onClose: () => void;
  onToggleHero: (heroId: string) => void;
  ossBaseUrl?: string; // 现在可选，默认使用 Vercel Blob
  onReset: () => void;
  canEdit: boolean;
}

const SelectedHeroesModal: React.FC<SelectedHeroesModalProps> = ({
  selectedHeroes,
  selectedHeroesGrouped,
  onClose,
  onToggleHero,
  ossBaseUrl,
  onReset,
  canEdit,
}) => {
  const { t, language } = useI18n();
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-6xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header - Only title and description */}
        <div className="flex-shrink-0 p-6 border-b border-zinc-700">
          <h2 className="text-2xl font-bold text-white">{t('ui.components.selectedHeroesModal.title')}</h2>
          <p className="text-zinc-400 mt-1">
            {t('ui.components.selectedHeroesModal.subtitle', { count: selectedHeroes.size })}
          </p>
        </div>

        {/* Modal Content - This is the only scrollable area */}
        <div className="p-6 overflow-y-auto flex-1">
          {selectedHeroes.size === 0 ? (
            <div className="text-center py-20 opacity-50">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-xl font-medium text-zinc-400">
                {t('ui.components.selectedHeroesModal.emptyTitle')}
              </p>
              <p className="text-sm text-zinc-500 mt-2">
                {t('ui.components.selectedHeroesModal.emptyDescription')}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Captain Section */}
              {selectedHeroesGrouped[HeroRole.CAPTAIN].length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-yellow-500">
                      captains
                    </h3>
                    {language === 'zh-CN' && (
                      <span className="text-sm font-bold text-zinc-400">{t('ui.components.selectedHeroesModal.categories.captain')}</span>
                    )}
                    <span className="ml-auto text-xs font-mono bg-zinc-800 px-2 py-1 rounded-full text-zinc-500">
                      {t('ui.components.selectedHeroesModal.heroCount', { count: selectedHeroesGrouped[HeroRole.CAPTAIN].length })}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {selectedHeroesGrouped[HeroRole.CAPTAIN].map((hero) => (
                      <div key={hero.id} className="text-center">
                        <div className="relative group">
                          <img
                            src={getHeroAvatarUrl(hero, ossBaseUrl)}
                            alt={hero.cnName}
                            className="w-full h-auto rounded-lg border-2 border-zinc-600 group-hover:border-blue-500 transition-colors cursor-pointer sm:cursor-default"
                             onClick={() => {
                               // 移动端点击删除（仅编辑模式）
                               if (window.innerWidth < 640 && canEdit) {
                                 onToggleHero(hero.id);
                               }
                             }}
                           />
                           {canEdit && (
                             <button
                               onClick={() => onToggleHero(hero.id)}
                               className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
                             >
                               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                               </svg>
                             </button>
                           )}
                         </div>
                         <p className="text-xs text-zinc-400 mt-1 font-medium">{hero.cnName}</p>
                         <p className="text-xs text-zinc-500">{hero.name}</p>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Jungle Section */}
               {selectedHeroesGrouped[HeroRole.JUNGLE].length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-emerald-500">
                      junglers
                    </h3>
                    {language === 'zh-CN' && (
                      <span className="text-sm font-bold text-zinc-400">{t('ui.components.selectedHeroesModal.categories.jungle')}</span>
                    )}
                    <span className="ml-auto text-xs font-mono bg-zinc-800 px-2 py-1 rounded-full text-zinc-500">
                      {t('ui.components.selectedHeroesModal.heroCount', { count: selectedHeroesGrouped[HeroRole.JUNGLE].length })}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {selectedHeroesGrouped[HeroRole.JUNGLE].map((hero) => (
                      <div key={hero.id} className="text-center">
                        <div className="relative group">
                          <img
                            src={getHeroAvatarUrl(hero, ossBaseUrl)}
                            alt={hero.cnName}
                            className="w-full h-auto rounded-lg border-2 border-zinc-600 group-hover:border-blue-500 transition-colors cursor-pointer sm:cursor-default"
                            onClick={() => {
                              // 移动端点击删除
                              if (window.innerWidth < 640) {
                                onToggleHero(hero.id);
                              }
                            }}
                           />
                           {canEdit && (
                             <button
                               onClick={() => onToggleHero(hero.id)}
                               className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
                             >
                               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                               </svg>
                             </button>
                           )}
                         </div>
                         <p className="text-xs text-zinc-400 mt-1 font-medium">{hero.cnName}</p>
                         <p className="text-xs text-zinc-500">{hero.name}</p>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Carry Section */}
               {selectedHeroesGrouped[HeroRole.CARRY].length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-red-500">
                      laners
                    </h3>
                    {language === 'zh-CN' && (
                      <span className="text-sm font-bold text-zinc-400">{t('ui.components.selectedHeroesModal.categories.carry')}</span>
                    )}
                    <span className="ml-auto text-xs font-mono bg-zinc-800 px-2 py-1 rounded-full text-zinc-500">
                      {t('ui.components.selectedHeroesModal.heroCount', { count: selectedHeroesGrouped[HeroRole.CARRY].length })}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {selectedHeroesGrouped[HeroRole.CARRY].map((hero) => (
                      <div key={hero.id} className="text-center">
                        <div className="relative group">
                          <img
                            src={getHeroAvatarUrl(hero, ossBaseUrl)}
                            alt={hero.cnName}
                            className="w-full h-auto rounded-lg border-2 border-zinc-600 group-hover:border-blue-500 transition-colors cursor-pointer sm:cursor-default"
                             onClick={() => {
                               // 移动端点击删除（仅编辑模式）
                               if (window.innerWidth < 640 && canEdit) {
                                 onToggleHero(hero.id);
                               }
                             }}
                           />
                           {canEdit && (
                             <button
                               onClick={() => onToggleHero(hero.id)}
                               className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
                             >
                               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                               </svg>
                             </button>
                           )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 font-medium">{hero.cnName}</p>
                        <p className="text-xs text-zinc-500">{hero.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer - Always show close button */}
        <div className="flex-shrink-0 p-6 border-t border-zinc-800">
          <div className="flex justify-end gap-3">
            {canEdit && (
              <button
                onClick={onReset}
                disabled={selectedHeroes.size === 0}
                className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg border transition-colors flex items-center gap-2 whitespace-nowrap ${
                  selectedHeroes.size === 0
                    ? "bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 shadow-lg shadow-red-500/20"
                }`}
              >
                {t('ui.components.selectedHeroesModal.reset')}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              {t('ui.components.selectedHeroesModal.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedHeroesModal;