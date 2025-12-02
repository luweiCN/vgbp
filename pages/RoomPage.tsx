import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HEROES } from '../constants';
import { searchHeroes, getHeroesByRole, ClassificationMode } from '../data/heroes';
import HeroCard from '../components/HeroCard';
import OnlineModeIndicator from '../components/OnlineModeIndicator';
import SelectedHeroesModal from '../components/SelectedHeroesModal';
import ResetConfirmModal from '../components/ResetConfirmModal';
import ClassificationInfoModal from '../components/ClassificationInfoModal';
import ClassificationToggle from '../components/ClassificationToggle';
import LayoutToggle from '../components/LayoutToggle';
import { Hero, HeroRole } from '../types';
import { useBPState } from '../hooks/useBPState';
import { useHeroChangeToast } from '../hooks/useHeroChangeToast';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import HeroSelectionToastContainer from '../components/HeroSelectionToastContainer';
import { supabase } from '../services/supabase';

// 本地存储的key
const STORAGE_KEY = 'vainglory-draft-selected-heroes';
const CLASSIFICATION_MODE_KEY = 'vainglory-draft-classification-mode';
const HIDE_SELECTED_KEY = 'vainglory-draft-hide-selected';

// OSS 配置
const OSS_BASE_URL = "https://www.luwei.space:4014/default/vainglory/heroes";

interface RoomPageProps {
  roomId: string;
  onBack: () => void;
}

const RoomPage: React.FC<RoomPageProps> = ({ roomId, onBack }) => {
  const navigate = useNavigate();

  // 判断是本地模式还是在线模式
  const isLocalMode = roomId === 'local';
  const pageTitle = isLocalMode ? '本地模式' : `房间 ${roomId}`;
  const pageSubtitle = isLocalMode ? '本地BP功能' : '在线BP功能';

  const { showError, showInfo, toasts, removeToast } = useToast();



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
  const heroSelectionToasts = toasts.filter(toast => toast.type === 'info' && (toast.addedHeroIds || toast.removedHeroIds));
  const otherToasts = toasts.filter(toast => toast.type !== 'info' || (!toast.addedHeroIds && !toast.removedHeroIds));

  // 使用英雄变化Toast hook
  useHeroChangeToast(selectedHeroes, (message: string, addedHeroIds: string[], removedHeroIds: string[]) => {
    showInfo(message, addedHeroIds, removedHeroIds);
  });

  // 搜索和过滤状态
  const [searchTerm, setSearchTerm] = useState('');
  const [classificationMode, setClassificationMode] = useState<ClassificationMode>(() => {
    try {
      const stored = localStorage.getItem(CLASSIFICATION_MODE_KEY);
      return stored ? JSON.parse(stored) : ClassificationMode.OFFICIAL;
    } catch (error) {
      console.error('Failed to load classificationMode from localStorage:', error);
      return ClassificationMode.OFFICIAL;
    }
  });

  const [hideSelected, setHideSelected] = useState(() => {
    try {
      const stored = localStorage.getItem(HIDE_SELECTED_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      console.error('Failed to load hideSelected from localStorage:', error);
      return false;
    }
  });

  const [showSelectedHeroes, setShowSelectedHeroes] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClassificationInfo, setShowClassificationInfo] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"auto" | "3" | "4" | "5">("auto");
  const [currentVisibleSection, setCurrentVisibleSection] = useState<"captain" | "jungle" | "carry" | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);

  // 保存分类模式到本地存储
  const saveClassificationMode = useCallback((mode: ClassificationMode) => {
    try {
      localStorage.setItem(CLASSIFICATION_MODE_KEY, JSON.stringify(mode));
    } catch (error) {
      console.error('Failed to save classification mode to localStorage:', error);
    }
  }, []);

  // 保存隐藏选项到本地存储
  const saveHideSelected = useCallback((hide: boolean) => {
    try {
      localStorage.setItem(HIDE_SELECTED_KEY, JSON.stringify(hide));
    } catch (error) {
      console.error('Failed to save hide selected to localStorage:', error);
    }
  }, []);

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

  // 返回按钮的文本和目标
  const getBackButtonText = () => {
    if (isLocalMode) {
      return '← 返回首页';
    } else {
      return '← 返回房间列表';
    }
  };

  const handleBack = () => {
    if (isLocalMode) {
      navigate('/');
    } else {
      // 在线房间返回到房间列表
      navigate('/rooms');
    }
  };

  // 获取房间名称
  useEffect(() => {
    const fetchRoomName = async () => {
      if (isOnlineMode && roomId) {
        try {
          const { data: room, error } = await supabase
            .from('rooms')
            .select('name')
            .eq('id', roomId)
            .single();
          
          if (!error && room) {
            setRoomName(room.name);
          }
        } catch (error) {
          console.error('Failed to fetch room name:', error);
        }
      }
    };

    fetchRoomName();
  }, [isOnlineMode, roomId]);

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
    let heroes = searchHeroes(HEROES, searchTerm);
    if (hideSelected) {
      heroes = heroes.filter((hero) => !selectedHeroes.has(hero.id));
    }
    return heroes;
  }, [searchTerm, selectedHeroes, hideSelected]);

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
      [HeroRole.CAPTAIN]: filteredHeroes.filter((h) => roleFilter(h, HeroRole.CAPTAIN)),
      [HeroRole.JUNGLE]: filteredHeroes.filter((h) => roleFilter(h, HeroRole.JUNGLE)),
      [HeroRole.CARRY]: filteredHeroes.filter((h) => roleFilter(h, HeroRole.CARRY)),
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
      [HeroRole.CAPTAIN]: selectedHeroesArray.filter((h) => roleFilter(h, HeroRole.CAPTAIN)),
      [HeroRole.JUNGLE]: selectedHeroesArray.filter((h) => roleFilter(h, HeroRole.JUNGLE)),
      [HeroRole.CARRY]: selectedHeroesArray.filter((h) => roleFilter(h, HeroRole.CARRY)),
    };
  }, [selectedHeroes, classificationMode]);

  // Get grid classes based on layout mode
  const getGridClasses = () => {
    switch (layoutMode) {
      case "3":
        return "max-w-2xl mx-auto grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-2 sm:gap-3";
      case "4":
        return "max-w-4xl mx-auto grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-2 sm:gap-3";
      case "5":
        return "max-w-5xl mx-auto grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 gap-2 sm:gap-3";
      case "auto":
      default:
        return "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3";
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
          <span className="text-lg font-bold opacity-60">{cnTitle}</span>
          <span className="ml-auto text-xs font-mono bg-zinc-900 px-2 py-1 rounded-full text-zinc-500">
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
        </div>
        <div className={getGridClasses()}>
          {heroes.map((hero) => (
            <HeroCard
              key={hero.id}
              hero={hero}
              isSelected={selectedHeroes.has(hero.id)}
              onToggle={isOnlineMode && !canEdit ? undefined : handleToggleHero}
              ossBaseUrl={OSS_BASE_URL}
              disabled={isOnlineMode && !canEdit}
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
              <div className="flex items-center gap-3 overflow-hidden" style={{width: canEdit ? '60vw' : '80vw', maxWidth: canEdit ? '60vw' : '80vw'}}>
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
                        </>
                      )}
                    </div>
                    
                    {/* 移动端：只显示房间名称 */}
                    <div className="sm:hidden">
                      {isOnlineMode && roomName ? (
                         <span className="text-sm text-zinc-300 font-medium truncate block" title={roomName}>
                          {roomName}
                        </span>
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
              <div className="hidden md:flex flex-grow justify-center max-w-md mx-4">
                <div className="flex items-center w-full bg-zinc-800/50 border border-zinc-800 rounded-lg px-3 py-1.5 gap-2">
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
                    placeholder="Search / 搜索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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

               {/* Right Section: Reset Button - Only show for room owners */}
               {canEdit && (
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Reset BP Button */}
                  <button
                    onClick={handleResetClick}
                    disabled={selectedHeroes.size === 0}
                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-colors flex items-center gap-2 whitespace-nowrap ${
                      selectedHeroes.size === 0
                        ? "bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 shadow-lg shadow-red-500/20"
                    }`}
                  >
                    重置BP
                  </button>
                </div>
              )}
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
              <div className="flex items-center w-full bg-zinc-800/50 border border-zinc-800 rounded-lg px-3 py-1.5 gap-2">
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
                  placeholder="Search / 搜索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
          <div className="sm:border-t sm:border-zinc-800 pt-3 pb-2">
            {/* Hide Selected Toggle */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-sm text-zinc-400">
                  已选 <span className="font-semibold text-white">{selectedHeroes.size}</span> 个英雄，剩余 <span className="font-semibold text-white">{HEROES.length - selectedHeroes.size}</span> 个英雄
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
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                  <LayoutToggle layoutMode={layoutMode} onChange={setLayoutMode} />
                  <span className="text-xs text-zinc-500">隐藏已选</span>
                  <button
                    onClick={() => {
                    if (selectedHeroes.size > 0) {
                      const newValue = !hideSelected;
                      setHideSelected(newValue);
                      saveHideSelected(newValue);
                    }
                  }}
                    disabled={selectedHeroes.size === 0}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedHeroes.size === 0
                        ? "bg-zinc-700 cursor-not-allowed opacity-50"
                        : hideSelected
                        ? "bg-orange-600"
                        : "bg-zinc-600"
                    }`}
                    title={selectedHeroes.size === 0 ? "请先选择英雄" : (hideSelected ? "显示已选英雄" : "隐藏已选英雄")}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        hideSelected ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Layout - Single Row */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-zinc-400 whitespace-nowrap">
                  已选 <span className="font-semibold text-white">{selectedHeroes.size}</span> 个，剩余 <span className="font-semibold text-white">{HEROES.length - selectedHeroes.size}</span> 个
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <LayoutToggle layoutMode={layoutMode} onChange={setLayoutMode} />
                  <span className="text-xs text-zinc-500">隐藏已选</span>
                  <button
                    onClick={() => {
                      const newValue = !hideSelected;
                      setHideSelected(newValue);
                      saveHideSelected(newValue);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      hideSelected
                        ? "bg-orange-600"
                        : "bg-zinc-600"
                    }`}
                    title={hideSelected ? "显示已选英雄" : "隐藏已选英雄"}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        hideSelected ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Border between sections */}
            <div className="border-t border-zinc-800 pt-2 mt-2"></div>

            {/* Current Section Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">当前位置:</span>
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
                    辅助
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
                    打野
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
                    输出
                  </button>
                </div>
              </div>

              {/* Classification Mode Toggle */}
              <div className="flex items-center gap-2">
                <ClassificationToggle
                  classificationMode={classificationMode}
                  onChange={setClassificationMode}
                  onSave={saveClassificationMode}
                  onShowInfo={() => setShowClassificationInfo(true)}
                />
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
            <span className="text-sm">同步中...</span>
          </div>
        </div>
      )}

      {bpError && (
        <div className="fixed top-20 right-4 z-50 bg-red-900/90 border border-red-700 text-red-200 px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">同步失败: {bpError}</span>
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
      <main className={`max-w-[1400px] mx-auto px-4 pb-8 ${getMainContainerClasses()}`}>
        {!hasAnyHeroes ? (
          <div className="text-center py-20 opacity-50">
            <p className="text-xl font-medium">
              No heroes found matching "{searchTerm}"
            </p>
          </div>
        ) : (
          <>
            {renderSection(
              HeroRole.CAPTAIN,
              "Captain",
              "指挥官 / 辅助",
              "text-yellow-500",
            )}
            {renderSection(
              HeroRole.JUNGLE,
              "Jungle",
              "打野",
              "text-emerald-500",
            )}
            {renderSection(
              HeroRole.CARRY,
              "Carry",
              "对线 / 核心",
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
        title={selectedHeroes.size === 0 ? "还没有选择英雄" : "查看已选英雄"}
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
        已选英雄 ({selectedHeroes.size})
      </button>

      {/* Selected Heroes Modal */}
      {showSelectedHeroes && (
        <SelectedHeroesModal
          selectedHeroes={selectedHeroes}
          selectedHeroesGrouped={selectedHeroesGrouped}
          onClose={() => setShowSelectedHeroes(false)}
          onToggleHero={handleToggleHero}
          ossBaseUrl={OSS_BASE_URL}
          onReset={handleResetClick}
          canEdit={canEdit}
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