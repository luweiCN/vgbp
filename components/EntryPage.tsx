import React from "react";
import { Home, Wifi } from "lucide-react";
import { Icon } from "./ui/Icon";
import { ToastContainer } from "./Toast";
import { useToast } from "../hooks/useToast";
import { useSafeI18n } from "../i18n/components/useSafeI18n";
import { LanguageSelector } from "../i18n/components/LanguageSelector";

interface EntryPageProps {
  onLocalMode: () => void;
  onOnlineMode: () => void;
}

const EntryPage: React.FC<EntryPageProps> = ({ onLocalMode, onOnlineMode }) => {
  const { toasts, removeToast } = useToast();
  const { translate: t } = useSafeI18n();

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 pt-4">
      <div className="max-w-4xl w-full mx-auto">
        {/* Language Selector */}
        <div className="flex justify-end mb-16">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">
              {t("ui.components.entryPage.language")}
            </span>
            <LanguageSelector showFlag showNativeName position="header" />
          </div>
        </div>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded bg-linear-to-br from-green-600 to-emerald-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-green-500/20 mx-auto mb-4">
            V
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-zinc-400 mb-2">
            Vainglory BP
          </h1>
          <p className="text-zinc-400 text-lg uppercase tracking-widest">
            Tactical Draft Assistant
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
            onClick={onOnlineMode}
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
        <div className="text-center">
          <p className="text-xs text-zinc-500">
            {t("ui.components.entryPage.modes.bottomInfo")}
          </p>
        </div>

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </div>
  );
};

export default EntryPage;
