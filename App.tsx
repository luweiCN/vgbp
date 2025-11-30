import React, { useState, useCallback, useMemo, useEffect } from "react";
import { HEROES } from "./constants";
import { searchHeroes, getHeroesByRole, ClassificationMode } from "./data/heroes";
import HeroCard from "./components/HeroCard";
import EntryPage from "./components/EntryPage";
import { Hero, HeroRole } from "./types";

// 本地存储的key
const STORAGE_KEY = 'vainglory-draft-selected-heroes';
const CLASSIFICATION_MODE_KEY = 'vainglory-draft-classification-mode';
const HIDE_SELECTED_KEY = 'vainglory-draft-hide-selected';

// OSS 配置
const OSS_BASE_URL = "https://www.luwei.space:4014/default/vainglory";

const App: React.FC = () => {

  // 应用状态 - 控制是否显示入口页面
  const [showEntryPage, setShowEntryPage] = useState(() => {
    // 检查是否是第一次访问或从外部链接直接进入
    const urlParams = new URLSearchParams(window.location.search);
    const hasDirectParam = urlParams.has('direct') || urlParams.has('room');
    return !hasDirectParam; // 如果有直接访问参数，跳过入口页面
  });

  // 从本地存储加载已选择的英雄
  const loadSelectedHeroes = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const heroIds = JSON.parse(stored);
        return new Set(heroIds);
      }
    } catch (error) {
      console.error('Failed to load selected heroes from localStorage:', error);
    }
    return new Set();
  }, []);

  // Store IDs of selected (pressed) heroes
  const [selectedHeroIds, setSelectedHeroIds] = useState<Set<string>>(
    () => loadSelectedHeroes()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [layoutMode, setLayoutMode] = useState<"auto" | "3" | "4" | "5">("auto");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClassificationInfo, setShowClassificationInfo] = useState(false);
  const [currentVisibleSection, setCurrentVisibleSection] = useState<'captain' | 'jungle' | 'carry' | null>(null);
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
  const [classificationMode, setClassificationMode] = useState<ClassificationMode>(() => {
    try {
      const stored = localStorage.getItem(CLASSIFICATION_MODE_KEY);
      return stored ? JSON.parse(stored) : ClassificationMode.OFFICIAL;
    } catch (error) {
      console.error('Failed to load classificationMode from localStorage:', error);
      return ClassificationMode.OFFICIAL;
    }
  });

  // 保存选择的英雄到本地存储
  const saveSelectedHeroes = useCallback((heroIds: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(heroIds)));
    } catch (error) {
      console.error('Failed to save selected heroes to localStorage:', error);
    }
  }, []);

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

  // Persist selected heroes
  useEffect(() => {
    saveSelectedHeroes(selectedHeroIds);
  }, [selectedHeroIds, saveSelectedHeroes]);

  // Handlers
  const handleToggleHero = useCallback((id: string) => {
    setSelectedHeroIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      // 保存到本地存储
      saveSelectedHeroes(newSet);
      return newSet;
    });
  }, [saveSelectedHeroes]);

  const handleReset = useCallback(() => {
    const newSet = new Set<string>();
    setSelectedHeroIds(newSet);
    setShowSelectedHeroes(false); // 关闭弹窗
    setShowResetConfirm(false);
    // 清空本地存储
    saveSelectedHeroes(newSet);
  }, [saveSelectedHeroes]);

  const handleResetClick = useCallback(() => {
    if (selectedHeroIds.size > 0) {
      setShowResetConfirm(true);
    }
  }, [selectedHeroIds.size]);

  // 弹窗内的toggle函数，不保存到本地存储（实际上弹窗内的卡片被禁用了交互）
  const handleModalToggleHero = useCallback((id: string) => {
    // 由于弹窗内卡片被禁用，这个函数实际上不会被调用
    // 但为了保持接口一致性，保留这个空函数
    return;
  }, []);

  // 入口页面事件处理函数
  const handleLocalMode = useCallback(() => {
    setShowEntryPage(false);
  }, []);

  const handleOnlineMode = useCallback(() => {
    // TODO: 实现在线模式逻辑
    console.log('在线模式功能开发中...');
    setShowEntryPage(false);
  }, []);

  // 自定义滚动函数，考虑sticky header高度
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 100;
      const elementTop = element.offsetTop - headerHeight - 20; // 减去header高度和额外偏移

      window.scrollTo({
        top: elementTop,
        behavior: 'smooth'
      });
    }
  }, []);

  // Handle scroll detection for current visible section
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { role: 'captain', id: 'captain-section' },
        { role: 'jungle', id: 'jungle-section' },
        { role: 'carry', id: 'carry-section' }
      ];

      // 获取sticky header的实际高度
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 100; // 默认100px作为fallback
      const scrollPosition = window.scrollY + headerHeight + 20; // 头部高度 + 一些额外偏移

      // 找到当前最接近顶部的section
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
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Filter Logic - 使用新的搜索函数
  const filteredHeroes = useMemo(() => {
    let heroes = searchHeroes(HEROES, searchTerm);
    // 如果隐藏已选开关打开，排除已选择的英雄
    if (hideSelected) {
      heroes = heroes.filter((hero) => !selectedHeroIds.has(hero.id));
    }
    return heroes;
  }, [searchTerm, selectedHeroIds, hideSelected]);

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

  // Get selected heroes grouped by role for the modal
  const selectedHeroesGrouped = useMemo(() => {
    const selectedHeroes = HEROES.filter((hero) => selectedHeroIds.has(hero.id));
    return {
      [HeroRole.CAPTAIN]: selectedHeroes.filter(
        (h) => h.role === HeroRole.CAPTAIN,
      ),
      [HeroRole.JUNGLE]: selectedHeroes.filter(
        (h) => h.role === HeroRole.JUNGLE,
      ),
      [HeroRole.CARRY]: selectedHeroes.filter(
        (h) => h.role === HeroRole.CARRY,
      ),
    };
  }, [selectedHeroIds]);

  const progressPercentage = Math.round(
    (selectedHeroIds.size / HEROES.length) * 100,
  );

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
            已选 {selectedHeroIds.size > 0 ? (() => {
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
              const selectedInCategory = categoryHeroes.filter(h => selectedHeroIds.has(h.id));
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
              const selectedInCategory = categoryHeroes.filter(h => selectedHeroIds.has(h.id));
              return `${categoryHeroes.length - selectedInCategory.length} 个`;
            })()}
          </span>
        </div>
        <div className={getGridClasses()}>
          {heroes.map((hero) => (
            <HeroCard
              key={hero.id}
              hero={hero}
              isSelected={selectedHeroIds.has(hero.id)}
              onToggle={handleToggleHero}
              ossBaseUrl={OSS_BASE_URL}
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
      {/* 入口页面 */}
      {showEntryPage ? (
        <EntryPage
          onLocalMode={handleLocalMode}
          onOnlineMode={handleOnlineMode}
        />
      ) : (
        <div className="min-h-screen bg-zinc-950 text-white pb-20 font-sans">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 shadow-xl">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">
                  V
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                    Vainglory BP
                  </h1>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest hidden sm:block">
                    Tactical Draft Tool
                  </p>
                </div>
              </div>

              {/* Layout Selector Only */}
              <div className="flex items-center gap-2">
                {/* Layout Selector - Inline */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLayoutMode("auto")}
                    className={`p-2 rounded-md transition-all duration-200 ${layoutMode === "auto" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}
                    title="Auto Layout"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setLayoutMode("3")}
                    className={`p-2 rounded-md transition-all duration-200 ${layoutMode === "3" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}
                    title="3 Columns"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a1 1 0 011-1h14a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V6zM4 14a1 1 0 011-1h14a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setLayoutMode("4")}
                    className={`p-2 rounded-md transition-all duration-200 ${layoutMode === "4" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}
                    title="4 Columns"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM3 14a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 14a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1v-6z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setLayoutMode("5")}
                    className={`p-2 rounded-md transition-all duration-200 ${layoutMode === "5" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}
                    title="5 Columns"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 4a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM9 4a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM16 4a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM5 14a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H6a1 1 0 01-1-1v-6zM12 14a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:w-64">
                <input
                  type="text"
                  placeholder="Search / 搜索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-700 rounded-lg py-1.5 px-4 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-zinc-500"
                />
                <svg
                  className="absolute left-2.5 top-2 h-4 w-4 text-zinc-500"
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
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-2 h-4 w-4 text-zinc-400 hover:text-zinc-200 transition-colors"
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

              <button
                onClick={handleResetClick}
                disabled={selectedHeroIds.size === 0}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-colors flex items-center gap-2 whitespace-nowrap ${
                  selectedHeroIds.size === 0
                    ? "bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 shadow-lg shadow-red-500/20"
                }`}
              >
                重置BP
              </button>
            </div>
          </div>
        </div>

        {/* Progress and Controls Section */}
        <div className="border-t border-zinc-800 pt-3 px-4 pb-2">
          {/* Hide Selected Toggle */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm text-zinc-400">
                已选 <span className="font-semibold text-white">{selectedHeroIds.size}</span> 个英雄，剩余 <span className="font-semibold text-white">{HEROES.length - selectedHeroIds.size}</span> 个英雄
              </div>

              {/* Progress Bar */}
              <div className="w-20 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              <div className="text-xs text-zinc-500">
                {progressPercentage}%
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-zinc-500 text-center max-w-sm">
                {selectedHeroIds.size > 0
                  ? (hideSelected
                      ? "已隐藏已选英雄，从列表中隐藏以便选择剩余英雄"
                      : "点击按钮可隐藏已选英雄，专注于选择剩余英雄")
                  : "选择英雄后可使用隐藏功能，专注于选择剩余英雄"
                }
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">隐藏已选</span>
                <button
                  onClick={() => {
                  if (selectedHeroIds.size > 0) {
                    const newValue = !hideSelected;
                    setHideSelected(newValue);
                    saveHideSelected(newValue);
                  }
                }}
                  disabled={selectedHeroIds.size === 0}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    selectedHeroIds.size === 0
                      ? "bg-zinc-700 cursor-not-allowed opacity-50"
                      : hideSelected
                      ? "bg-orange-600"
                      : "bg-zinc-600"
                  }`}
                  title={selectedHeroIds.size === 0 ? "请先选择英雄" : (hideSelected ? "显示已选英雄" : "隐藏已选英雄")}
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

          {/* Mobile Layout - Two Rows */}
          <div className="sm:hidden space-y-3">
            {/* First row: Progress info and progress bar */}
            <div className="flex items-center gap-3">
              <div className="text-sm text-zinc-400 whitespace-nowrap">
                已选 <span className="font-semibold text-white">{selectedHeroIds.size}</span> 个英雄，剩余 <span className="font-semibold text-white">{HEROES.length - selectedHeroIds.size}</span> 个英雄
              </div>
              <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-zinc-500 whitespace-nowrap">
                {progressPercentage}%
              </div>
            </div>

            {/* Second row: Button and description */}
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-zinc-500 flex-1">
                {selectedHeroIds.size > 0
                  ? (hideSelected
                      ? "已隐藏已选，专注选择剩余英雄"
                      : "隐藏已选，专注选择剩余英雄")
                  : "选择后可隐藏已选英雄"
                }
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-zinc-500">隐藏已选</span>
                <button
                  onClick={() => {
                  if (selectedHeroIds.size > 0) {
                    const newValue = !hideSelected;
                    setHideSelected(newValue);
                    saveHideSelected(newValue);
                  }
                }}
                  disabled={selectedHeroIds.size === 0}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    selectedHeroIds.size === 0
                      ? "bg-zinc-700 cursor-not-allowed opacity-50"
                      : hideSelected
                      ? "bg-orange-600"
                      : "bg-zinc-600"
                  }`}
                  title={selectedHeroIds.size === 0 ? "请先选择英雄" : (hideSelected ? "显示已选英雄" : "隐藏已选英雄")}
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
                  onClick={() => scrollToSection('captain-section')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    currentVisibleSection === 'captain'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  辅助
                </button>
                <button
                  onClick={() => scrollToSection('jungle-section')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    currentVisibleSection === 'jungle'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  打野
                </button>
                <button
                  onClick={() => scrollToSection('carry-section')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    currentVisibleSection === 'carry'
                      ? 'bg-red-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  对线
                </button>
              </div>
            </div>

            {/* Classification Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 hidden sm:inline">英雄分类:</span>
              <button
                onClick={() => setShowClassificationInfo(true)}
                className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="分类说明"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <div className="flex items-center gap-1 bg-zinc-800 rounded-full p-1">
                <button
                  onClick={() => {
                  setClassificationMode(ClassificationMode.OFFICIAL);
                  saveClassificationMode(ClassificationMode.OFFICIAL);
                }}
                  className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                    classificationMode === ClassificationMode.OFFICIAL
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                  }`}
                  title="按官方定位分类"
                >
                  官方
                </button>
                <button
                  onClick={() => {
                  setClassificationMode(ClassificationMode.COMMON);
                  saveClassificationMode(ClassificationMode.COMMON);
                }}
                  className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                    classificationMode === ClassificationMode.COMMON
                      ? "bg-green-600 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                  }`}
                  title="按玩家常见位置分类"
                >
                  常见
                </button>
                <button
                  onClick={() => {
                  setClassificationMode(ClassificationMode.FLEX);
                  saveClassificationMode(ClassificationMode.FLEX);
                }}
                  className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                    classificationMode === ClassificationMode.FLEX
                      ? "bg-orange-600 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                  }`}
                  title="按理论上可以打的位置分类"
                >
                  灵活
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full mx-auto shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">确认重置BP</h3>
            <p className="text-zinc-400 mb-6">
              确定要清空已选择的 {selectedHeroIds.size} 个英雄吗？此操作不可撤销。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Classification Info Modal */}
      {showClassificationInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">英雄分类说明</h3>
              <button
                onClick={() => setShowClassificationInfo(false)}
                className="text-zinc-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-blue-900/30 rounded-lg">
                <h4 className="font-semibold text-blue-400 mb-1">官方定位</h4>
                <p className="text-zinc-300">
                  按照游戏官方设定的位置分类。每个英雄只有一个固定位置，这是最标准的分类方式。
                </p>
              </div>
              <div className="p-3 bg-green-900/30 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-1">常见位置</h4>
                <p className="text-zinc-300">
                  基于玩家实际游戏习惯分类。英雄会出现在他们最常被打的位置，更贴近实际游戏情况。
                </p>
              </div>
              <div className="p-3 bg-orange-900/30 rounded-lg">
                <h4 className="font-semibold text-orange-400 mb-1">灵活位置</h4>
                <p className="text-zinc-300">
                  按照理论上可以打的位置分类。英雄会出现在所有能够胜任的位置，帮助发现更多战术可能性。
                </p>
              </div>
            </div>
          </div>
        </div>
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
          selectedHeroIds.size === 0
            ? "bg-zinc-900 text-zinc-500 border-zinc-700 cursor-not-allowed opacity-50"
            : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 shadow-lg shadow-blue-500/20"
        }`}
        disabled={selectedHeroIds.size === 0}
        title={selectedHeroIds.size === 0 ? "还没有选择英雄" : "查看已选英雄"}
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
        已选英雄 ({selectedHeroIds.size})
      </button>

      {/* Selected Heroes Modal */}
      {showSelectedHeroes && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                已选择的英雄 ({selectedHeroIds.size})
              </h2>
              <button
                onClick={() => setShowSelectedHeroes(false)}
                className="text-zinc-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from(selectedHeroIds).map((heroId) => {
                const hero = HEROES.find((h) => h.id === heroId);
                if (!hero) return null;
                return (
                  <div key={hero.id} className="text-center">
                    <div className="relative group">
                      <img
                        src={`${OSS_BASE_URL}/${hero.id}.jpg`}
                        alt={hero.cnName}
                        className="w-full h-auto rounded-lg border-2 border-zinc-600 group-hover:border-blue-500 transition-colors"
                      />
                      <button
                        onClick={() => handleToggleHero(hero.id)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-zinc-300">{hero.cnName}</p>
                    <p className="text-xs text-zinc-500">{hero.name}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  handleReset();
                  setShowSelectedHeroes(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                清空所有
              </button>
              <button
                onClick={() => setShowSelectedHeroes(false)}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal - temporarily removed */}
        </div>
      )}
    </>
  );
}

export default App;