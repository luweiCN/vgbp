import React, { useState, useCallback, useMemo } from "react";
import { HEROES } from "./constants";
import { searchHeroes, HEROES_BY_ROLE } from "./data/heroes";
import HeroCard from "./components/HeroCard";
import { HeroRole } from "./types";

// OSS 配置 - 请在这里设置你的 OSS 地址
const OSS_BASE_URL = 'https://your-oss-bucket.oss-region.aliyuncs.com';

const App: React.FC = () => {
  // Store IDs of selected (pressed) heroes
  const [selectedHeroIds, setSelectedHeroIds] = useState<Set<string>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState("");

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
  }, []);

  
  // Filter Logic - 使用新的搜索函数
  const filteredHeroes = useMemo(() => {
    return searchHeroes(HEROES, searchTerm);
  }, [searchTerm]);

  const groupedHeroes = useMemo(() => {
    return {
      [HeroRole.CAPTAIN]: filteredHeroes.filter((h) => h.role === HeroRole.CAPTAIN),
      [HeroRole.JUNGLE]: filteredHeroes.filter((h) => h.role === HeroRole.JUNGLE),
      [HeroRole.CARRY]: filteredHeroes.filter((h) => h.role === HeroRole.CARRY),
    };
  }, [filteredHeroes]);

  const progressPercentage = Math.round(
    (selectedHeroIds.size / HEROES.length) * 100,
  );

  const renderSection = (
    role: HeroRole,
    title: string,
    cnTitle: string,
    colorClass: string,
  ) => {
    const heroes = groupedHeroes[role];
    if (heroes.length === 0) return null;

    return (
      <section className="mb-10 animate-fade-in">
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
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3">
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
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:w-64">
                <input
                  type="text"
                  placeholder="Search / 搜索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-700 rounded-lg py-1.5 px-4 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-zinc-500"
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
              </div>

              {/* Desktop Share Button */}
              <button
                onClick={() => setShowShareModal(true)}
                className="hidden md:flex p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="Share to Mobile"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </button>

              <button
                onClick={handleReset}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-red-900/30 hover:text-red-400 text-zinc-300 text-xs font-bold uppercase tracking-wider rounded-lg border border-zinc-700 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 relative h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-[1400px] mx-auto px-4 py-8">
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


    </div>
  );
};

export default App;
