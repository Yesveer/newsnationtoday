"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { dictionary, type Language, type TranslationKey } from "@/lib/i18n/dictionary";
import { DEFAULT_LANGUAGE, findLanguage, isSupportedLanguage } from "@/config/languages.config";
import { applyTranslateTarget } from "@/lib/i18n/google-translate";

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

/** Readable from outside React too — the Google Translate widget needs it
 *  before the first render. */
export function getStoredLanguage(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isSupportedLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function getSnapshot(): string {
  return getStoredLanguage();
}

// Server (and the hydration pass) always render the default, so markup matches;
// a stored preference is applied right after hydration.
const getServerSnapshot = (): string => DEFAULT_LANGUAGE;

/** The site's own UI strings exist in Hindi and English. English is used as-is;
 *  every other language starts from the Hindi chrome, which Google then
 *  translates along with the rest of the page — so the source stays uniform. */
function dictionaryLanguage(code: string): Language {
  return code === "en" ? "en" : "hi";
}

interface LanguageContextValue {
  /** The reader's chosen language — any code from `languages.config`. */
  language: string;
  /** Switches the public site: stores it, points Google at it, reloads. */
  setLanguage: (language: string) => void;
  /** Same preference without the reload — for the admin portal, which
   *  translates its own strings and must not lose an open form. */
  setUiLanguage: (language: string) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const config = findLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = config?.rtl ? "rtl" : "ltr";
  }, [language]);

  const setUiLanguage = useCallback((next: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // private mode — the choice still applies to this page view
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const setLanguage = useCallback(
    (next: string) => {
      setUiLanguage(next);
      applyTranslateTarget(next);
      // Google re-translates the document on load, so a reload is the cleanest
      // way to swap languages without a half-translated DOM left behind.
      window.location.reload();
    },
    [setUiLanguage],
  );

  const t = useCallback(
    (key: TranslationKey) => dictionary[dictionaryLanguage(language)][key],
    [language],
  );

  return <LanguageContext value={{ language, setLanguage, setUiLanguage, t }}>{children}</LanguageContext>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
