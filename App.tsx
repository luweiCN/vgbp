
import React, { useState, useCallback, useMemo } from 'react';
import { HEROES } from './constants';
import HeroCard from './components/HeroCard';
import { getDraftAnalysis } from './services/geminiService';
import { HeroRole, AIAdviceResponse } from './types';

const App: React.FC = () => {
  // Store IDs of selected (pressed) heroes
  const [selectedHeroIds, setSelectedHeroIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<AIAdviceResponse | null>(null);
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  
  // Share/QR State
  const [showShareModal, setShowShareModal] = useState(false);

  // Handlers
  const handleToggleHero = useCallback((id: string) => {
    setSelectedHeroIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        return newSet; 
      } else {
        newSet.add(id);
        return newSet;
      }
    });
  }, []);

  const handleReset = useCallback(() => {
    setSelectedHeroIds(new Set());
    setAiAdvice(null);
    setShowAdviceModal(false);
  }, []);

  const handleGetAdvice = async () => {
    if (selectedHeroIds.size === 0) return;
    
    setAiLoading(true);
    setShowAdviceModal(true);
    try {
      const unavailableHeroes = HEROES.filter(h => selectedHeroIds.has(h.id));
      const result = await getDraftAnalysis(unavailableHeroes);
      setAiAdvice(result);
    } catch (e) {
      console.error(e);
      setAiAdvice({
        analysis: "Could not connect to the AI Coach.",
        suggestedPicks: [],
        threats: []
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Filter Logic
  const groupedHeroes = useMemo(() => {
    const filtered = HEROES.filter(hero => {
      const searchLower = searchTerm.toLowerCase();
      return hero.name.toLowerCase().includes(searchLower) || hero.cnName.includes(searchTerm);
    });

    return {
      [HeroRole.CAPTAIN]: filtered.filter(h => h.role === HeroRole.CAPTAIN),
      [HeroRole.JUNGLE]: filtered.filter(h => h.role === HeroRole.JUNGLE),
      [HeroRole.CARRY]: filtered.filter(h => h.role === HeroRole.CARRY),
    };
  }, [searchTerm]);

  const progressPercentage = Math.round((selectedHeroIds.size / HEROES.length) * 100);

  const renderSection = (role: HeroRole, title: string, cnTitle: string, colorClass: string) => {
    const heroes = groupedHeroes[role];
    if (heroes.length === 0) return null;

    return (
      <section className="mb-10 animate-fade-in">
        <div className={`flex items-baseline gap-2 mb-4 border-b border-zinc-800 pb-2 ${colorClass}`}>
           <h2 className="text-2xl font-black uppercase tracking-tighter">{title}</h2>
           <span className="text-lg font-bold opacity-60">{cnTitle}</span>
           <span className="ml-auto text-xs font-mono bg-zinc-900 px-2 py-1 rounded-full text-zinc-500">
             {heroes.length} Heroes
           </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3">
          {heroes.map(hero => (
            <HeroCard 
              key={hero.id} 
              hero={hero} 
              isSelected={selectedHeroIds.has(hero.id)} 
              onToggle={handleToggleHero} 
            />
          ))}
        </div>
      </section>
    );
  };

  const hasAnyHeroes = Object.values(groupedHeroes).some(arr => arr.length > 0);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

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
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest hidden sm:block">Tactical Draft Tool</p>
                </div>
              </div>
              
              {/* Mobile Share Button (Visible on small screens) */}
              <button 
                onClick={() => setShowShareModal(true)}
                className="md:hidden p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
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
                  <svg className="absolute left-2.5 top-2 h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
              </div>

              {/* Desktop Share Button */}
              <button 
                onClick={() => setShowShareModal(true)}
                className="hidden md:flex p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="Share to Mobile"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>

              <button 
                onClick={handleGetAdvice}
                disabled={selectedHeroIds.size === 0 || aiLoading}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {aiLoading ? "Thinking..." : "AI Help"}
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
             <p className="text-xl font-medium">No heroes found matching "{searchTerm}"</p>
          </div>
        ) : (
          <>
            {renderSection(HeroRole.CAPTAIN, 'Captain', '指挥官 / 辅助', 'text-yellow-500')}
            {renderSection(HeroRole.JUNGLE, 'Jungle', '打野', 'text-emerald-500')}
            {renderSection(HeroRole.CARRY, 'Carry', '对线 / 核心', 'text-red-500')}
          </>
        )}
      </main>

      {/* Share / QR Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col items-center">
              <h3 className="text-xl font-bold text-white mb-2">Scan to Open</h3>
              <p className="text-zinc-400 text-sm mb-6 text-center">Open your camera app to view this tool on your phone.</p>
              
              <div className="bg-white p-4 rounded-xl mb-6">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`} 
                  alt="QR Code" 
                  className="w-48 h-48"
                />
              </div>

              <div className="w-full bg-zinc-950 p-3 rounded-lg border border-zinc-800 mb-6 flex items-center gap-2">
                 <span className="text-zinc-500 text-xs truncate flex-1">{currentUrl}</span>
                 <button 
                    onClick={() => navigator.clipboard.writeText(currentUrl)}
                    className="text-blue-500 text-xs font-bold hover:text-blue-400"
                 >
                   COPY
                 </button>
              </div>

              <button 
                onClick={() => setShowShareModal(false)}
                className="w-full py-2 bg-zinc-800 text-white font-bold rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Close
              </button>
           </div>
        </div>
      )}

      {/* AI Advice Modal */}
      {showAdviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-zinc-800/50">
               <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-purple-400">✦</span> Tactical Analysis
                  </h2>
                  <p className="text-zinc-400 text-sm mt-1">AI-powered suggestions based on current bans.</p>
               </div>
               <button onClick={() => setShowAdviceModal(false)} className="text-zinc-500 hover:text-white">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {aiLoading ? (
                 <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    <p className="text-zinc-400 animate-pulse">Consulting the meta...</p>
                 </div>
              ) : aiAdvice ? (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Analysis</h3>
                    <p className="text-zinc-200 leading-relaxed bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50">
                      {aiAdvice.analysis}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-500">Recommended Picks</h3>
                       <ul className="space-y-2">
                         {aiAdvice.suggestedPicks.map((pick, i) => (
                           <li key={i} className="flex items-center gap-3 bg-zinc-950 p-3 rounded border border-zinc-800">
                             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-900 text-emerald-300 text-xs font-bold">{i + 1}</span>
                             <span className="font-semibold">{pick}</span>
                           </li>
                         ))}
                       </ul>
                    </div>
                    
                    <div className="space-y-3">
                       <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">Enemy Threats</h3>
                       <ul className="space-y-2">
                         {aiAdvice.threats.map((threat, i) => (
                           <li key={i} className="flex items-center gap-3 bg-zinc-950 p-3 rounded border border-zinc-800">
                             <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                             </svg>
                             <span className="font-semibold">{threat}</span>
                           </li>
                         ))}
                       </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-red-400">Failed to load data. Please try again.</div>
              )}
            </div>
            
            <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end">
              <button 
                onClick={() => setShowAdviceModal(false)}
                className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
