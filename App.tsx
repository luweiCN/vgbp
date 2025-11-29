import React, { useState, useCallback, useMemo, useEffect } from "react";
import { HEROES } from "./constants";
import { searchHeroes, HEROES_BY_ROLE } from "./data/heroes";
import HeroCard from "./components/HeroCard";
import { HeroRole } from "./types";

// OSS 配置 - 请在这里设置你的 OSS 地址
const OSS_BASE_URL = "https://www.luwei.space:4014/default/vainglory";

const App: React.FC = () => {
  // Store IDs of selected (pressed) heroes
  const [selectedHeroIds, setSelectedHeroIds] = useState<Set<string>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [layoutMode, setLayoutMode] = useState<"auto" | "3" | "4" | "5">("auto");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [currentVisibleSection, setCurrentVisibleSection] = useState<'captain' | 'jungle' | 'carry' | null>(null);
  const [hideSelected, setHideSelected] = useState(false);
  const [showSelectedHeroes, setShowSelectedHeroes] = useState(false);

  // Handlers
  const handleToggleHero = useCallback((id: string) => {
    setSelectedHeroIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleReset = useCallback(() => {
    setSelectedHeroIds(new Set());
    setShowResetConfirm(false);
  }, []);

  const handleResetClick = useCallback(() => {
    if (selectedHeroIds.size > 0) {
      setShowResetConfirm(true);
    }
  }, [selectedHeroIds.size]);

  // Handle scroll detection for current visible section
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { role: 'captain', id: 'captain-section' },
        { role: 'jungle', id: 'jungle-section' },
        { role: 'carry', id: 'carry-section' }
      ];

      const scrollPosition = window.scrollY + 200; // 头部高度 + 一些偏移

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

  const groupedHeroes = useMemo(() => {
    return {
      [HeroRole.CAPTAIN]: filteredHeroes.filter(
        (h) => h.role === HeroRole.CAPTAIN,
      ),
      [HeroRole.JUNGLE]: filteredHeroes.filter(
        (h) => h.role === HeroRole.JUNGLE,
      ),
      [HeroRole.CARRY]: filteredHeroes.filter((h) => h.role === HeroRole.CARRY),
    };
  }, [filteredHeroes]);

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
      [HeroRole.CARRY]: selectedHeroes.filter((h) => h.role === HeroRole.CARRY),
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
            {heroes.length} Heroes
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

              </div>
          </div>

  
          {/* Current Section Indicator */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">当前位置:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => document.getElementById('captain-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    currentVisibleSection === 'captain'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  辅助
                </button>
                <button
                  onClick={() => document.getElementById('jungle-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    currentVisibleSection === 'jungle'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  打野
                </button>
                <button
                  onClick={() => document.getElementById('carry-section')?.scrollIntoView({ behavior: 'smooth' })}
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

            {/* Progress Bar */}
            <div className="flex-1 ml-4 mr-0 h-1 bg-zinc-800 rounded-full overflow-hidden max-w-[200px]">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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

      {/* Main Grid */}
      <main className={`max-w-[1400px] mx-auto px-4 py-8 ${getMainContainerClasses()}`}>
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
        className={`fixed bottom-24 right-8 z-30 flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-full border-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 ${
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
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="hidden sm:inline">已选英雄</span>
        <span className="bg-black/20 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
          {selectedHeroIds.size}
        </span>
        </button>

  
      {/* Selected Heroes Modal */}
      {showSelectedHeroes && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-6xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-700">
              <div>
                <h2 className="text-2xl font-bold text-white">已选英雄</h2>
                <p className="text-zinc-400 mt-1">
                  共选择了 {selectedHeroIds.size} 个英雄
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetClick}
                  disabled={selectedHeroIds.size === 0}
                  className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg border transition-colors flex items-center gap-2 whitespace-nowrap ${
                    selectedHeroIds.size === 0
                      ? "bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 shadow-lg shadow-red-500/20"
                  }`}
                >
                  重置BP
                </button>
                <button
                  onClick={() => setShowSelectedHeroes(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-zinc-400"
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
              </div>
            </div>

            {/* Modal Controls */}
            {selectedHeroIds.size > 0 && (
              <div className="px-6 pt-4 pb-4 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400">列表设置:</span>
                    <button
                      onClick={() => setHideSelected(!hideSelected)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 ${
                        hideSelected
                          ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700 shadow-lg shadow-orange-500/20"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 hover:border-zinc-600"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {hideSelected ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112.194 0M13.875 18.825A10.05 10.05 0 0112.194 0M12 19.825a10.05 10.05 0 01-2.07 0M6.75 15a10.05 10.05 0 00-2.07 0"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM12 15a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        )}
                      </svg>
                      <span>{hideSelected ? "列表显示已选" : "列表隐藏已选"}</span>
                    </button>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {hideSelected ? "已选英雄在主列表中已隐藏" : "已选英雄在主列表中仍显示"}
                  </span>
                </div>
              </div>
            )}

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedHeroIds.size === 0 ? (
                <div className="text-center py-20 opacity-50">
                  <div className="text-6xl mb-4">🎮</div>
                  <p className="text-xl font-medium text-zinc-400">
                    还没有选择任何英雄
                  </p>
                  <p className="text-sm text-zinc-500 mt-2">
                    点击英雄卡片来选择英雄
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Captain Section */}
                  {selectedHeroesGrouped[HeroRole.CAPTAIN].length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                        <h3 className="text-xl font-black uppercase tracking-tighter text-yellow-500">
                          Captain
                        </h3>
                        <span className="text-sm font-bold text-zinc-400">指挥官 / 辅助</span>
                        <span className="ml-auto text-xs font-mono bg-zinc-800 px-2 py-1 rounded-full text-zinc-500">
                          {selectedHeroesGrouped[HeroRole.CAPTAIN].length} Heroes
                        </span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {selectedHeroesGrouped[HeroRole.CAPTAIN].map((hero) => (
                          <HeroCard
                            key={hero.id}
                            hero={hero}
                            isSelected={true}
                            onToggle={handleToggleHero}
                            ossBaseUrl={OSS_BASE_URL}
                            inModal={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Jungle Section */}
                  {selectedHeroesGrouped[HeroRole.JUNGLE].length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                        <h3 className="text-xl font-black uppercase tracking-tighter text-emerald-500">
                          Jungle
                        </h3>
                        <span className="text-sm font-bold text-zinc-400">打野</span>
                        <span className="ml-auto text-xs font-mono bg-zinc-800 px-2 py-1 rounded-full text-zinc-500">
                          {selectedHeroesGrouped[HeroRole.JUNGLE].length} Heroes
                        </span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {selectedHeroesGrouped[HeroRole.JUNGLE].map((hero) => (
                          <HeroCard
                            key={hero.id}
                            hero={hero}
                            isSelected={true}
                            onToggle={handleToggleHero}
                            ossBaseUrl={OSS_BASE_URL}
                            inModal={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Carry Section */}
                  {selectedHeroesGrouped[HeroRole.CARRY].length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                        <h3 className="text-xl font-black uppercase tracking-tighter text-red-500">
                          Carry
                        </h3>
                        <span className="text-sm font-bold text-zinc-400">对线 / 核心</span>
                        <span className="ml-auto text-xs font-mono bg-zinc-800 px-2 py-1 rounded-full text-zinc-500">
                          {selectedHeroesGrouped[HeroRole.CARRY].length} Heroes
                        </span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {selectedHeroesGrouped[HeroRole.CARRY].map((hero) => (
                          <HeroCard
                            key={hero.id}
                            hero={hero}
                            isSelected={true}
                            onToggle={handleToggleHero}
                            ossBaseUrl={OSS_BASE_URL}
                            inModal={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
