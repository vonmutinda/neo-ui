"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface TelegramContextValue {
  isTMA: boolean;
  haptic: (type: "light" | "medium" | "heavy") => void;
}

const TelegramContext = createContext<TelegramContextValue>({
  isTMA: false,
  haptic: () => {},
});

export function useTelegram() {
  return useContext(TelegramContext);
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  HapticFeedback: {
    impactOccurred: (style: string) => void;
  };
  themeParams: Record<string, string>;
  colorScheme: "light" | "dark";
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isTMA, setIsTMA] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    setIsTMA(true);
    tg.ready();
    tg.expand();

    // Sync Telegram theme params to CSS custom properties
    const params = tg.themeParams;
    const root = document.documentElement;
    if (params.bg_color) root.style.setProperty("--tg-theme-bg-color", params.bg_color);
    if (params.text_color) root.style.setProperty("--tg-theme-text-color", params.text_color);
    if (params.button_color) root.style.setProperty("--tg-theme-button-color", params.button_color);
    if (params.button_text_color) root.style.setProperty("--tg-theme-button-text-color", params.button_text_color);
    if (params.secondary_bg_color) root.style.setProperty("--tg-theme-secondary-bg-color", params.secondary_bg_color);

    root.classList.add("tma-theme");
    if (tg.colorScheme === "dark") {
      root.classList.add("dark");
    }
  }, []);

  const haptic = (type: "light" | "medium" | "heavy") => {
    window.Telegram?.WebApp?.HapticFeedback.impactOccurred(type);
  };

  return (
    <TelegramContext.Provider value={{ isTMA, haptic }}>
      {children}
    </TelegramContext.Provider>
  );
}
