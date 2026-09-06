"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { dictionary, type Language, type TranslationKey } from "@/lib/i18n/dictionary";

const STORAGE_KEY = "newshub-language";
const CHANGE_EVENT = "newshub-language-change";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Language {
  return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "hi";
}

// Server (and the hydration pass) always render Hindi, so markup matches;
// a stored English preference is applied right after hydration.
const getServerSnapshot = (): Language => "hi";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const t = useCallback((key: TranslationKey) => dictionary[language][key], [language]);

  return <LanguageContext value={{ language, setLanguage, t }}>{children}</LanguageContext>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
