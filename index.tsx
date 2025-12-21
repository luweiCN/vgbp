import React from "react";
import ReactDOM from "react-dom/client";
import { AptabaseProvider } from '@aptabase/react';
import App from "./App";
import { LanguageTracker } from "./components/LanguageTracker";
import "./index.css";
import "./styles/global.css";

// 从 package.json 获取应用版本
const appVersion = import.meta.env.npm_package_version || '0.0.0';

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <AptabaseProvider
    appKey={import.meta.env.VITE_APTABASE_APP_KEY}
    appVersion={appVersion}
  >
    <LanguageTracker />
    <App />
  </AptabaseProvider>
);

