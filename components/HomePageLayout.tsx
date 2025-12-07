import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Wifi } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { useSafeI18n } from "@/i18n/components/useSafeI18n";
import { LanguageSelector } from "@/i18n/components/LanguageSelector";
import { VersionDisplay } from "@/components/VersionDisplay";

interface HomePageProps {
  onLocalMode: () => void;
  onEnterRoom: (roomId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLocalMode, onEnterRoom }) => {
  const navigate = useNavigate();
  const { toasts, removeToast } = useToast();
  const { translate: t } = useSafeI18n();
  const [showVersionModal, setShowVersionModal] = React.useState(false);

  // Handle clicks outside version modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showVersionModal) {
        const versionModal = document.querySelector('[data-version-modal]');
        if (versionModal && !versionModal.contains(event.target as Node)) {
          const versionButton = document.querySelector('[data-version-button]');
          if (versionButton && !versionButton.contains(event.target as Node)) {
            setShowVersionModal(false);
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showVersionModal]);

  const handleOnlineMode = () => {
    navigate('/rooms');
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Fixed Header with Language Selector */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/60 backdrop-blur-xl border-b border-zinc-800/30 safe-area-padding-top shadow-lg">
        <div className="max-w-[1400px] w-full mx-auto px-4 h-full flex items-center justify-end">
          <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-300 font-medium">
                {t("ui.components.entryPage.language")}
              </span>
              <LanguageSelector showFlag showNativeName position="header" />
          </div>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto pb-12 content-padding-top">
        <div className="max-w-[1400px] w-full mx-auto px-4 py-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4">
              <img
                src="/favicon.svg"
                alt="Vainglory BP Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold sm:font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-zinc-400 mb-2">
              Vainglory BP
            </h1>
            <p className="text-zinc-400 text-sm sm:text-lg uppercase tracking-[0.2em] sm:tracking-widest font-light">
              Vainglory Global BP Tool
            </p>
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Local Mode Card */}
            <div
              onClick={onLocalMode}
              className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 cursor-pointer hover:bg-zinc-900/80 hover:border-green-600/50 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
                  <Icon icon={Home} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-green-400 mb-2">
                  {t("ui.components.entryPage.modes.local")}
                </h2>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {t("ui.components.entryPage.modes.localDesc")}
                </p>
                <div className="mt-4 text-xs text-zinc-500">
                  {t("ui.components.entryPage.modes.localFeatures")}
                </div>
              </div>
            </div>

            {/* Online Mode Card */}
            <div
              onClick={handleOnlineMode}
              className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 cursor-pointer hover:bg-zinc-900/80 hover:border-blue-600/50 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                  <Icon icon={Wifi} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-blue-400 mb-2">
                  {t("ui.components.entryPage.modes.online")}
                </h2>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {t("ui.components.entryPage.modes.onlineDesc")}
                </p>
                <div className="mt-4 text-xs text-zinc-500">
                  {t("ui.components.entryPage.modes.onlineFeatures")}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="text-center pb-8">
            <p className="text-xs text-zinc-500">
              {t("ui.components.entryPage.modes.bottomInfo")}
            </p>
          </div>
        </div>
      </main>

      {/* Fixed Footer with Version Display */}
      <footer className="fixed bottom-0 left-0 right-0 z-[60] h-12 bg-black/60 backdrop-blur-xl border-t border-zinc-800/30 shadow-lg">
        <VersionDisplay
          showDetails={showVersionModal}
          onShowDetailsChange={setShowVersionModal}
        />
      </footer>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default HomePage;