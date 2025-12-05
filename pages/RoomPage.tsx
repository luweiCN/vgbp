import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HEROES } from '@/constants';
import { searchHeroes, ClassificationMode } from '@/data/heroes';
import HeroCard from '@/components/HeroCard';
import OnlineModeIndicator from '@/components/OnlineModeIndicator';
import SelectedHeroesModal from '@/components/SelectedHeroesModal';
import ResetConfirmModal from '@/components/ResetConfirmModal';
import ClassificationInfoModal from '@/components/ClassificationInfoModal';
import ClassificationToggle from '@/components/ClassificationToggle';
import LayoutToggle from '@/components/LayoutToggle';
import { RoomFormModal } from '@/components/RoomFormModal';
import { Hero, HeroRole } from '@/types';
import { useBPState } from '@/hooks/useBPState';
import { useHeroChangeToast } from '@/hooks/useHeroChangeToast';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { useRoomSettings } from '@/hooks/useRoomSettings';
import { useI18n } from '@/i18n/hooks/useI18n';
import { LanguageToggle } from '@/i18n/components/LanguageSelector';
import { ToastContainer } from '@/components/Toast';
import HeroSelectionToastContainer from '@/components/HeroSelectionToastContainer';
import { supabase } from '@/services/supabase';
import { useDefaultIsMobile } from '@/hooks/useIsMobile';
// import { useEnhancedSearch } from '@/hooks/useEnhancedSearch'; // TODO: 暂时注释，等搜索建议功能完善后再启用


// 现在使用 Vercel Blob，不再需要 OSS 配置

interface RoomPageProps {
  roomId: string;
}

const RoomPage: React.FC<RoomPageProps> = ({ roomId }) => {
  const navigate = useNavigate();

  // 判断是本地模式还是在线模式
  const isLocalMode = roomId === 'local';

  const { showSuccess, showInfo, toasts, removeToast } = useToast();
  const { user } = useAuth();
  const { t, language, isLanguageReady } = useI18n();



  // 使用BP状态管理hook
  const {
    selectedHeroes,
    loading: bpLoading,
    error: bpError,
    isOnlineMode,
    canEdit,
    isOwner,
    isRealtimeConnected,
    lastSyncTime,
    lastSendTime,
    syncMethod,
    toggleHero,
    clearAllHeroes
  } = useBPState(isLocalMode ? null : roomId);

  // 分离英雄选择相关的Toast和其他Toast
  const heroSelectionToasts = toasts.filter((toast: any) => toast.type === 'info' && (toast.addedHeroIds || toast.removedHeroIds));
  const otherToasts = toasts.filter((toast: any) => toast.type !== 'info' || (!toast.addedHeroIds && !toast.removedHeroIds));

  // 使用英雄变化Toast hook
  useHeroChangeToast(selectedHeroes, (message: string, addedHeroIds: string[], removedHeroIds: string[]) => {
    showInfo(message, addedHeroIds, removedHeroIds);
  }, t, isLanguageReady, language);

  // 使用统一的房间设置管理
  const {
    layoutMode,
    hideSelected,
    isCompactLayout,
    classificationMode,
    setLayoutMode,
    setHideSelected,
    setIsCompactLayout,
    setClassificationMode,
  } = useRoomSettings();

  // 搜索和过滤状态
  const [searchTerm, setSearchTerm] = useState('');

  const [showSelectedHeroes, setShowSelectedHeroes] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClassificationInfo, setShowClassificationInfo] = useState(false);
  const [currentVisibleSection, setCurrentVisibleSection] = useState<"captain" | "jungle" | "carry" | null>(null);
  const isMobile = useDefaultIsMobile();

  // 处理移动端循环切换
  const handleMobileSectionToggle = () => {
    const sections: Array<"captain" | "jungle" | "carry"> = ["captain", "jungle", "carry"];
    const currentIndex = currentVisibleSection ? sections.indexOf(currentVisibleSection) : 0;
    const nextIndex = (currentIndex + 1) % sections.length;
    const nextSection = sections[nextIndex];

    // 滚动到对应分区
    const element = document.getElementById(`${nextSection}-section`);
    if (element) {
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 100;
      const elementTop = element.offsetTop - headerHeight - 20;
      window.scrollTo({ top: elementTop, behavior: 'smooth' });
    }
  };
  const [roomName, setRoomName] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  
  // Handlers
  const handleToggleHero = useCallback(async (id: string) => {
    await toggleHero(id);
  }, [toggleHero]);

  const handleReset = useCallback(async () => {
    // 使用新的 clearAllHeroes 函数一次性清空所有英雄
    await clearAllHeroes();
    setShowSelectedHeroes(false);
    setShowResetConfirm(false);
  }, [clearAllHeroes]);

  const handleResetClick = useCallback(() => {
    if (selectedHeroes.size > 0) {
      setShowResetConfirm(true);
    }
  }, [selectedHeroes.size]);

  const handleBack = () => {
    if (isLocalMode) {
      navigate('/');
    } else {
      // 在线房间返回到房间列表
      navigate('/rooms');
    }
  };

  
  // 获取房间信息
  useEffect(() => {
    const fetchRoomInfo = async () => {
      if (isOnlineMode && roomId) {
        try {
          const { data: room, error } = await supabase
            .from('rooms')
            .select('id, name, description, owner_id')
            .eq('id', roomId)
            .single();

          if (!error && room) {
            setRoomName(room.name);
            setEditingRoom(room);
          }
        } catch (error) {
          console.error('Failed to fetch room info:', error);
        }
      }
    };

    fetchRoomInfo();
  }, [isOnlineMode, roomId]);

  // 编辑房间相关函数
  const handleEditRoomClick = () => {
    // editingRoom 已经包含了房间信息，直接打开弹窗
    setShowEditForm(true);
  };

  const handleRoomUpdated = (message: string, updatedRoom?: any) => {
    setShowEditForm(false);

    // 显示成功提示
    showSuccess(message);

    if (updatedRoom) {
      setRoomName(updatedRoom.name);
      setEditingRoom(updatedRoom);

      // 更新浏览器标题
      if (typeof window !== 'undefined') {
        document.title = `${updatedRoom.name} - Vainglory BP`;
      }
    }
  };

  // Handle scroll detection for current visible section
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { role: 'captain', id: 'captain-section' },
        { role: 'jungle', id: 'jungle-section' },
        { role: 'carry', id: 'carry-section' }
      ];

      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 100;
      const scrollPosition = window.scrollY + headerHeight + 20;

      let currentSection: typeof currentVisibleSection = null;
      let minDistance = Infinity;

      sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
          const elementTop = element.offsetTop;
          const distance = Math.abs(scrollPosition - elementTop);

          if (distance < minDistance) {
            minDistance = distance;
            currentSection = section.role as typeof currentVisibleSection;
          }
        }
      });

      setCurrentVisibleSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Filter Logic
  const filteredHeroes = useMemo(() => {
    let heroes = searchHeroes(HEROES, searchTerm, language);
    if (hideSelected) {
      heroes = heroes.filter((hero) => !selectedHeroes.has(hero.id));
    }
    return heroes;
  }, [searchTerm, selectedHeroes, hideSelected, language]);

  const groupedHeroes: Record<HeroRole, Hero[]> = useMemo(() => {
    const roleFilter = (hero: Hero, role: HeroRole) => {
      switch (classificationMode) {
        case ClassificationMode.COMMON:
          return !hero.commonRoles || hero.commonRoles.includes(role);
        case ClassificationMode.FLEX:
          return !hero.flexRoles || hero.flexRoles.includes(role);
        case ClassificationMode.OFFICIAL:
        default:
          return hero.role === role;
      }
    };

    return {
      [HeroRole.CAPTAIN]: filteredHeroes.filter((h: Hero) => roleFilter(h, HeroRole.CAPTAIN)),
      [HeroRole.JUNGLE]: filteredHeroes.filter((h: Hero) => roleFilter(h, HeroRole.JUNGLE)),
      [HeroRole.CARRY]: filteredHeroes.filter((h: Hero) => roleFilter(h, HeroRole.CARRY)),
    };
  }, [filteredHeroes, classificationMode]);

  const selectedHeroesGrouped = useMemo(() => {
    const selectedHeroesArray = HEROES.filter((hero) => selectedHeroes.has(hero.id));

    const roleFilter = (hero: Hero, role: HeroRole) => {
      switch (classificationMode) {
        case ClassificationMode.COMMON:
          return !hero.commonRoles || hero.commonRoles.includes(role);
        case ClassificationMode.FLEX:
          return !hero.flexRoles || hero.flexRoles.includes(role);
        case ClassificationMode.OFFICIAL:
        default:
          return hero.role === role;
      }
    };

    return {
      [HeroRole.CAPTAIN]: selectedHeroesArray.filter((h: Hero) => roleFilter(h, HeroRole.CAPTAIN)),
      [HeroRole.JUNGLE]: selectedHeroesArray.filter((h: Hero) => roleFilter(h, HeroRole.JUNGLE)),
      [HeroRole.CARRY]: selectedHeroesArray.filter((h: Hero) => roleFilter(h, HeroRole.CARRY)),
    };
  }, [selectedHeroes, classificationMode]);

  // Get grid classes based on layout mode
  const getGridClasses = () => {
    const isCompact = isCompactLayout;
    const gapClass = isCompact ? "gap-0" : "gap-2 sm:gap-3";

    switch (layoutMode) {
      case "3":
        return `max-w-2xl mx-auto grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 ${gapClass}`;
      case "4":
        return `max-w-4xl mx-auto grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 ${gapClass}`;
      case "5":
        return `max-w-5xl mx-auto grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 ${gapClass}`;
      case "auto":
      default:
        return `grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 ${gapClass}`;
    }
  };

  // Get main container classes based on layout mode
  const getMainContainerClasses = () => {
    return layoutMode !== "auto" ? "" : "";
  };

  const renderSection = (
    role: HeroRole,
    title: string,
    cnTitle: string,
    colorClass: string,
  ) => {
    const heroes = groupedHeroes[role];
    if (heroes.length === 0) return null;

    const sectionWidthClass = layoutMode !== "auto" ?
    (layoutMode === "3" ? "max-w-2xl" : layoutMode === "4" ? "max-w-4xl" : "max-w-5xl") : "";

    return (
      <section
        id={role === HeroRole.CAPTAIN ? "captain-section" : role === HeroRole.JUNGLE ? "jungle-section" : role === HeroRole.CARRY ? "carry-section" : undefined}
        className={`mb-10 animate-fade-in ${layoutMode !== "auto" ? `${sectionWidthClass} mx-auto` : ""}`}
      >
        <div
          className={`flex items-baseline gap-2 mb-4 border-b border-zinc-800 pb-2 ${colorClass}`}
        >
          <h2 className="text-2xl font-black uppercase tracking-tighter">
            {title}
          </h2>
          {language === 'zh-CN' && (
            <span className="text-lg font-bold opacity-60">{cnTitle}</span>
          )}
          <span className="ml-auto text-xs font-mono bg-zinc-900 px-2 py-1 rounded-full text-zinc-500">
            <span className="hidden sm:inline">
              已选 {selectedHeroes.size > 0 ? (() => {
                const categoryHeroes = HEROES.filter(h => {
                  switch (classificationMode) {
                    case ClassificationMode.COMMON:
                      return !h.commonRoles || h.commonRoles.includes(role);
                    case ClassificationMode.FLEX:
                      return !h.flexRoles || h.flexRoles.includes(role);
                    case ClassificationMode.OFFICIAL:
                    default:
                      return h.role === role;
                  }
                });
                const selectedInCategory = categoryHeroes.filter(h => selectedHeroes.has(h.id));
                return `${selectedInCategory.length} 个`;
              })() : '0 个'}，剩余 {(() => {
                const categoryHeroes = HEROES.filter(h => {
                  switch (classificationMode) {
                    case ClassificationMode.COMMON:
                      return !h.commonRoles || h.commonRoles.includes(role);
                    case ClassificationMode.FLEX:
                      return !h.flexRoles || h.flexRoles.includes(role);
                    case ClassificationMode.OFFICIAL:
                    default:
                      return h.role === role;
                  }
                });
                const selectedInCategory = categoryHeroes.filter(h => selectedHeroes.has(h.id));
                return `${categoryHeroes.length - selectedInCategory.length} 个`;
              })()}
            </span>
            <span className="sm:hidden">
              {(() => {
                const categoryHeroes = HEROES.filter(h => {
                  switch (classificationMode) {
                    case ClassificationMode.COMMON:
                      return !h.commonRoles || h.commonRoles.includes(role);
                    case ClassificationMode.FLEX:
                      return !h.flexRoles || h.flexRoles.includes(role);
                    case ClassificationMode.OFFICIAL:
                    default:
                      return h.role === role;
                  }
                });
                const selectedInCategory = categoryHeroes.filter(h => selectedHeroes.has(h.id));
                return `${selectedInCategory.length}/${categoryHeroes.length}`;
              })()}
            </span>
          </span>
        </div>
        <div className={getGridClasses()}>
          {heroes.map((hero) => (
            <HeroCard
              key={hero.id}
              hero={hero}
              isSelected={selectedHeroes.has(hero.id)}
              onToggle={isOnlineMode && !canEdit ? undefined : handleToggleHero}
              // 不再需要 ossBaseUrl，默认使用 Vercel Blob
              disabled={isOnlineMode && !canEdit}
              isCompactLayout={isCompactLayout}
            />
          ))}
        </div>
      </section>
    );
  };

  const hasAnyHeroes = Object.values(groupedHeroes).some(
    (arr) => arr.length > 0,
  );

  return (
    <>
      {/* Toast Containers - 移到最外层确保最高层级 */}
      <HeroSelectionToastContainer
        toasts={heroSelectionToasts}
        onRemove={removeToast}
      />
      <ToastContainer
        toasts={otherToasts}
        onRemove={removeToast}
      />
      
      <div className="min-h-screen bg-zinc-950 text-white pb-20 font-sans">
      {/* Header - 恢复原来的设计 */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 shadow-xl px-4">
        <div className="max-w-[1400px] mx-auto pt-3">
          {/* Top Row: Logo, Title, Search, Reset Button */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section: Back Button, Logo, Title */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {(isOnlineMode || isLocalMode) && (
                  <button
                    onClick={handleBack}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                )}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0 ${
                    isOnlineMode
                      ? 'bg-gradient-to-br from-green-600 to-emerald-600 shadow-green-500/20'
                      : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/20'
                  }`}>
                    V
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* 桌面端：显示Logo和房间名称 */}
                    <div className="hidden sm:flex items-center gap-2">
                      <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 flex-shrink-0">
                        Vainglory BP
                      </h1>
                      {isOnlineMode && roomName && (
                        <>
                          <span className="text-xs text-zinc-400 flex-shrink-0">|</span>
                          <span className="text-xs text-zinc-300 font-medium truncate" title={roomName}>
                            {roomName}
                          </span>
                          {user && editingRoom && user.id === editingRoom.owner_id && (
                            <button
                              onClick={handleEditRoomClick}
                              className="p-0.5 text-zinc-400 hover:text-blue-400 hover:bg-blue-600/20 rounded transition-colors flex-shrink-0"
                              title={t('ui.components.roomPage.controls.editRoom')}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* 移动端：只显示房间名称 */}
                    <div className="sm:hidden flex items-center gap-2 min-w-0 flex-1">
                      {isOnlineMode && roomName ? (
                        <>
                          <span className="text-sm text-zinc-300 font-medium truncate block" title={roomName}>
                            {roomName}
                          </span>
                          {user && editingRoom && user.id === editingRoom.owner_id && (
                            <button
                              onClick={handleEditRoomClick}
                              className="p-0.5 text-zinc-400 hover:text-blue-400 hover:bg-blue-600/20 rounded transition-colors flex-shrink-0"
                              title={t('ui.components.roomPage.controls.editRoom')}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                        </>
                      ) : (
                        <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                          Vainglory BP
                        </h1>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest hidden sm:block">
                      Tactical Draft Tool
                    </p>
                  </div>
                </div>
              </div>

              {/* Center Section: Search Box - Hidden on mobile, shown on desktop */}
              <div className="hidden md:flex justify-center w-56 flex-shrink-0">
                <div className="flex items-center w-full h-[38px] bg-zinc-800/50 border border-zinc-800 rounded-lg px-3 gap-2">
                  {/* Search Icon */}
                  <svg
                    className="h-4 w-4 text-zinc-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {/* Input Field */}
                  <input
                    type="text"
                    placeholder={t('ui.components.roomPage.search.placeholder')}
                    value={searchTerm}
                    onChange={(e: any) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white placeholder-zinc-400 outline-none border-none focus:outline-none focus:ring-0"
                  />
                  {/* Clear Button */}
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="h-4 w-4 text-zinc-400 hover:text-zinc-200 transition-colors flex-shrink-0"
                      title={t('ui.components.roomPage.search.clearTitle')}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

               {/* Right Section: Reset Button and Language Toggle */}
               <div className="flex items-center gap-3 flex-shrink-0">
                 {/* Reset BP Button - Only show for room owners */}
                 {canEdit && (
                   <button
                     onClick={handleResetClick}
                     disabled={selectedHeroes.size === 0}
                     className={`relative flex items-center justify-center gap-1 w-auto h-[38px] px-4 rounded-xl transition-all duration-200 font-medium text-sm whitespace-nowrap ${
                       selectedHeroes.size === 0
                         ? "bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-zinc-600 cursor-not-allowed"
                         : "bg-red-600/90 backdrop-blur-sm border border-red-600/50 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
                     }`}
                   >
                     {t('ui.components.roomPage.controls.resetBP')}
                   </button>
                 )}

                   {/* Language Toggle */}
                 <LanguageToggle />
               </div>
            </div>

            {/* Online Mode Indicator - Below Logo, Above Search Box */}
            <OnlineModeIndicator
              roomId={roomId}
              isConnected={isRealtimeConnected}
              lastSyncTime={lastSyncTime}
              lastSendTime={lastSendTime}
              syncMethod={syncMethod}
              isOnlineMode={isOnlineMode}
              isOwner={isOwner}
              canEdit={canEdit}
            />

            {/* Mobile Search Box - Only shown on mobile */}
            <div className="md:hidden">
              <div className="flex items-center w-full bg-zinc-800/50 border border-zinc-800 rounded-lg px-3 py-1.5 mt-3 gap-2">
                {/* Search Icon */}
                <svg
                  className="h-4 w-4 text-zinc-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {/* Input Field */}
                <input
                  type="text"
                  placeholder={t('ui.components.roomPage.search.placeholder')}
                  value={searchTerm}
                  onChange={(e: any) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white placeholder-zinc-400 outline-none border-none focus:outline-none focus:ring-0"
                />
                {/* Clear Button */}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="h-4 w-4 text-zinc-400 hover:text-zinc-200 transition-colors flex-shrink-0"
                    title="Clear search"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Progress and Controls Section */}
          <div className="sm:border-t sm:border-zinc-800 sm:mt-3 pt-3 pb-2">
        {/* Desktop Layout - Two Rows */}
            <div className="hidden sm:block space-y-3">
              {/* First Row: Progress + Classification + Hide Selected */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-zinc-400">
                    {t('ui.components.roomPage.progress.desktop', {
                      selected: selectedHeroes.size,
                      remaining: HEROES.length - selectedHeroes.size
                    })}
                  </div>
                  {/* Progress Bar */}
                  <div className="w-20 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${Math.round((selectedHeroes.size / HEROES.length) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-zinc-500">
                    {Math.round((selectedHeroes.size / HEROES.length) * 100)}%
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                  <ClassificationToggle
                    classificationMode={classificationMode}
                    onChange={setClassificationMode}
                    onSave={setClassificationMode}
                    onShowInfo={() => setShowClassificationInfo(true)}
                  />
                  <span className="text-xs text-zinc-500">{t('ui.components.roomPage.controls.hideSelectedShort')}</span>
                  <button
                    onClick={() => {
                      const newValue = !hideSelected;
                      setHideSelected(newValue);
                      setHideSelected(newValue);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      hideSelected
                        ? "bg-blue-600"
                        : "bg-zinc-600"
                    }`}
                    title={hideSelected ? t('ui.components.roomPage.controls.showSelected') : t('ui.components.roomPage.controls.hideSelected')}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        hideSelected ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Second Row: Current Position + Layout Controls */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-zinc-500">{t('ui.components.roomPage.controls.currentPosition')}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        const element = document.getElementById('captain-section');
                        if (element) {
                          const header = document.querySelector('header');
                          const headerHeight = header ? header.offsetHeight : 100;
                          const elementTop = element.offsetTop - headerHeight - 20;
                          window.scrollTo({ top: elementTop, behavior: 'smooth' });
                        }
                      }}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        currentVisibleSection === 'captain'
                          ? 'bg-yellow-500 text-black'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      {t('ui.components.roomPage.sections.captain')}
                    </button>
                    <button
                      onClick={() => {
                        const element = document.getElementById('jungle-section');
                        if (element) {
                          const header = document.querySelector('header');
                          const headerHeight = header ? header.offsetHeight : 100;
                          const elementTop = element.offsetTop - headerHeight - 20;
                          window.scrollTo({ top: elementTop, behavior: 'smooth' });
                        }
                      }}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        currentVisibleSection === 'jungle'
                          ? 'bg-emerald-500 text-black'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      {t('ui.components.roomPage.sections.jungle')}
                    </button>
                    <button
                      onClick={() => {
                        const element = document.getElementById('carry-section');
                        if (element) {
                          const header = document.querySelector('header');
                          const headerHeight = header ? header.offsetHeight : 100;
                          const elementTop = element.offsetTop - headerHeight - 20;
                          window.scrollTo({ top: elementTop, behavior: 'smooth' });
                        }
                      }}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        currentVisibleSection === 'carry'
                          ? 'bg-red-500 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      {t('ui.components.roomPage.sections.carry')}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <LayoutToggle layoutMode={layoutMode} onChange={setLayoutMode} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {t('ui.components.roomPage.controls.compactLayout')}
                    </span>
                    <button
                      onClick={() => {
                        const newValue = !isCompactLayout;
                        setIsCompactLayout(newValue);
                        setIsCompactLayout(newValue);
                      }}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${isCompactLayout ? 'bg-blue-600' : 'bg-zinc-600'}
                      `}
                      title={isCompactLayout ? t('ui.components.roomPage.controls.autoLayout') : t('ui.components.roomPage.controls.compactLayout')}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${isCompactLayout ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout - Two Rows */}
            <div className="sm:hidden space-y-3">
              {/* First Row: Progress + Classification + Hide Selected */}
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-zinc-400 whitespace-nowrap">
                  {t('ui.components.roomPage.progress.mobile', {
                    selected: selectedHeroes.size,
                    remaining: HEROES.length - selectedHeroes.size,
                    total: HEROES.length
                  })}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ClassificationToggle
                    classificationMode={classificationMode}
                    onChange={setClassificationMode}
                    onSave={setClassificationMode}
                    onShowInfo={() => setShowClassificationInfo(true)}
                  />
                  <span className="text-xs text-zinc-500">{t('ui.components.roomPage.controls.hideSelectedShort')}</span>
                  <button
                    onClick={() => {
                      const newValue = !hideSelected;
                      setHideSelected(newValue);
                      setHideSelected(newValue);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      hideSelected
                        ? "bg-blue-600"
                        : "bg-zinc-600"
                    }`}
                    title={hideSelected ? t('ui.components.roomPage.controls.showSelected') : t('ui.components.roomPage.controls.hideSelected')}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        hideSelected ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Second Row: Current Position + Layout Controls */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-zinc-500">{t('ui.components.roomPage.controls.currentPosition')}</span>
                  {isMobile ? (
                    // 移动端循环切换 - 恢复原来的样式
                    <button
                      onClick={handleMobileSectionToggle}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        currentVisibleSection === 'captain'
                          ? 'bg-yellow-500 text-black'
                          : currentVisibleSection === 'jungle'
                          ? 'bg-emerald-500 text-black'
                          : currentVisibleSection === 'carry'
                          ? 'bg-red-500 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      {currentVisibleSection === 'captain'
                        ? t('ui.components.roomPage.sections.captain')
                        : currentVisibleSection === 'jungle'
                        ? t('ui.components.roomPage.sections.jungle')
                        : currentVisibleSection === 'carry'
                        ? t('ui.components.roomPage.sections.carry')
                        : t('ui.components.roomPage.sections.captain')}
                    </button>
                  ) : (
                    // 桌面端三个独立按钮
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          const element = document.getElementById('captain-section');
                          if (element) {
                            const header = document.querySelector('header');
                            const headerHeight = header ? header.offsetHeight : 100;
                            const elementTop = element.offsetTop - headerHeight - 20;
                            window.scrollTo({ top: elementTop, behavior: 'smooth' });
                          }
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          currentVisibleSection === 'captain'
                            ? 'bg-yellow-500 text-black'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                        }`}
                      >
                        {t('ui.components.roomPage.sections.captain')}
                      </button>
                      <button
                        onClick={() => {
                          const element = document.getElementById('jungle-section');
                          if (element) {
                            const header = document.querySelector('header');
                            const headerHeight = header ? header.offsetHeight : 100;
                            const elementTop = element.offsetTop - headerHeight - 20;
                            window.scrollTo({ top: elementTop, behavior: 'smooth' });
                          }
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          currentVisibleSection === 'jungle'
                            ? 'bg-emerald-500 text-black'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                        }`}
                      >
                        {t('ui.components.roomPage.sections.jungle')}
                      </button>
                      <button
                        onClick={() => {
                          const element = document.getElementById('carry-section');
                          if (element) {
                            const header = document.querySelector('header');
                            const headerHeight = header ? header.offsetHeight : 100;
                            const elementTop = element.offsetTop - headerHeight - 20;
                            window.scrollTo({ top: elementTop, behavior: 'smooth' });
                          }
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          currentVisibleSection === 'carry'
                            ? 'bg-red-500 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                        }`}
                      >
                        {t('ui.components.roomPage.sections.carry')}
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <LayoutToggle layoutMode={layoutMode} onChange={setLayoutMode} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {t('ui.components.roomPage.controls.compactLayout')}
                    </span>
                    <button
                      onClick={() => {
                        const newValue = !isCompactLayout;
                        setIsCompactLayout(newValue);
                        setIsCompactLayout(newValue);
                      }}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${isCompactLayout ? 'bg-blue-600' : 'bg-zinc-600'}
                      `}
                      title={isCompactLayout ? t('ui.components.roomPage.controls.autoLayout') : t('ui.components.roomPage.controls.compactLayout')}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${isCompactLayout ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            
            </div>
        </div>
      </header>

      {/* BP Loading & Error States */}
      {bpLoading && (
        <div className="fixed top-20 right-4 z-50 bg-blue-900/90 border border-blue-700 text-blue-200 px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">{t('ui.components.roomPage.status.syncing')}</span>
          </div>
        </div>
      )}

      {bpError && (
        <div className="fixed top-20 right-4 z-50 bg-red-900/90 border border-red-700 text-red-200 px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{t('ui.components.roomPage.status.syncFailed', { error: bpError })}</span>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <ResetConfirmModal
          selectedCount={selectedHeroes.size}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={handleReset}
        />
      )}

      {/* Classification Info Modal */}
      {showClassificationInfo && (
        <ClassificationInfoModal
          onClose={() => setShowClassificationInfo(false)}
        />
      )}

      {/* Main Grid */}
      <main className={`max-w-[1400px] mx-auto px-4 py-4 pb-8 ${getMainContainerClasses()}`}>
        {!hasAnyHeroes ? (
          <div className="text-center py-20 opacity-50">
            <p className="text-xl font-medium">
              {t('ui.components.roomPage.search.noHeroesFound', { searchTerm })}
            </p>
          </div>
        ) : (
          <>
            {renderSection(
              HeroRole.CAPTAIN,
              "captains",
              t('ui.components.roomPage.sections.captain'),
              "text-yellow-500",
            )}
            {renderSection(
              HeroRole.JUNGLE,
              "junglers",
              t('ui.components.roomPage.sections.jungle'),
              "text-emerald-500",
            )}
            {renderSection(
              HeroRole.CARRY,
              "laners",
              t('ui.components.roomPage.sections.carry'),
              "text-red-500",
            )}
          </>
        )}
      </main>

      {/* Selected Heroes Button */}
      <button
        onClick={() => setShowSelectedHeroes(true)}
        className={`fixed bottom-8 right-8 z-30 flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-full border-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 ${
          selectedHeroes.size === 0
            ? "bg-zinc-900 text-zinc-500 border-zinc-700 cursor-not-allowed opacity-50"
            : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 shadow-lg shadow-blue-500/20"
        }`}
        disabled={selectedHeroes.size === 0}
        title={selectedHeroes.size === 0 ? t('ui.components.roomPage.controls.noHeroesSelected') : t('ui.components.roomPage.controls.viewSelected')}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        {t('ui.components.roomPage.selectedHeroesButton', { count: selectedHeroes.size })}
      </button>

      {/* Selected Heroes Modal */}
      {showSelectedHeroes && (
        <SelectedHeroesModal
          selectedHeroes={selectedHeroes}
          selectedHeroesGrouped={selectedHeroesGrouped}
          onClose={() => setShowSelectedHeroes(false)}
          onToggleHero={handleToggleHero}
          // 不再需要 ossBaseUrl，默认使用 Vercel Blob
          onReset={handleResetClick}
          canEdit={canEdit}
        />
      )}

      {/* 房间编辑弹窗 */}
      {showEditForm && editingRoom && (
        <RoomFormModal
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          mode="edit"
          room={editingRoom}
          onSuccess={handleRoomUpdated}
        />
      )}

      {/* Toast Containers - 移到页面最前面确保最高层级 */}
      <HeroSelectionToastContainer
        toasts={heroSelectionToasts}
        onRemove={removeToast}
      />
      <ToastContainer
        toasts={otherToasts}
        onRemove={removeToast}
      />
    </div>
    </>
  );
};

export default RoomPage;