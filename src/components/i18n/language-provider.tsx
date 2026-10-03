"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { dictionary, type Language, type TranslationKey } from "@/lib/i18n/dictionary";
import { DEFAULT_LANGUAGE, SOURCE_LANGUAGE } from "@/config/languages.config";
import type { LanguageSetting } from "@/config/appearance.config";
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

/** Readable from outside React too — the page translator needs it before the
 *  first render. */
export function getStoredLanguage(fallback = DEFAULT_LANGUAGE): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || fallback;
  } catch {
    return fallback;
  }
}

/** The site's own UI strings exist in Hindi and English. English is used as-is;
 *  every other language starts from the Hindi chrome, which the page
 *  translator then converts along with the rest of the page. */
function dictionaryLanguage(code: string): Language {
  return code === "en" ? "en" : "hi";
}

interface LanguageContextValue {
  /** The reader's chosen language. */
  language: string;
  /** Switches the public site: stores it, points the translator at it, reloads. */
  setLanguage: (language: string) => void;
  /** Same preference without the reload — for the admin portal, which
   *  translates its own strings and must not lose an open form. */
  setUiLanguage: (language: string) => void;
  t: (key: TranslationKey) => string;
  /** The languages the newsroom offers, straight from the database. */
  options: LanguageSetting[];
  defaultLanguage: string;
  /** What the newsroom writes in — everything is translated from this. */
  sourceLanguage: string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Language state for the whole product.
 *
 * Which languages exist, which one is the default and which one the newsroom
 * writes in all come from the admin portal's settings, so adding a language is
 * a change an editor makes — not a deploy.
 */
export function LanguageProvider({
  children,
  options,
  defaultLanguage = DEFAULT_LANGUAGE,
  sourceLanguage = SOURCE_LANGUAGE,
}: {
  children: ReactNode;
  options: LanguageSetting[];
  defaultLanguage?: string;
  sourceLanguage?: string;
}) {
  const enabled = useMemo(
    () => options.filter((option) => option.enabled !== false),
    [options],
  );

  const getSnapshot = useCallback(() => {
    const stored = getStoredLanguage(defaultLanguage);
    // A language the newsroom has since removed falls back to the default.
    return enabled.some((option) => option.code === stored) ? stored : defaultLanguage;
  }, [enabled, defaultLanguage]);

  // Server (and the hydration pass) always render the default, so markup
  // matches; a stored preference is applied right after hydration.
  const getServerSnapshot = useCallback(() => defaultLanguage, [defaultLanguage]);

  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const config = enabled.find((option) => option.code === language);
    document.documentElement.lang = language;
    document.documentElement.dir = config?.rtl ? "rtl" : "ltr";
  }, [language, enabled]);

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
      applyTranslateTarget(next, sourceLanguage);
      // The translator re-reads the document on load, so a reload is the
      // cleanest way to swap languages without a half-translated DOM.
      window.location.reload();
    },
    [setUiLanguage, sourceLanguage],
  );

  const t = useCallback(
    (key: TranslationKey) => dictionary[dictionaryLanguage(language)][key],
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      setUiLanguage,
      t,
      options: enabled,
      defaultLanguage,
      sourceLanguage,
    }),
    [language, setLanguage, setUiLanguage, t, enabled, defaultLanguage, sourceLanguage],
  );

  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
