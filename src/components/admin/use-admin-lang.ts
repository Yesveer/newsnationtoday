"use client";

import { useCallback } from "react";
import { useLanguage } from "@/components/i18n/language-provider";

/** Bilingual helper for the portal: `t("हिंदी", "English")`.
 *
 *  English and Hindi come from these pairs, exactly. Any other language keeps
 *  the Hindi string, which the page translator then converts along with the
 *  rest of the page — the same deal the public site gets. The preference is
 *  shared, so switching in either place moves the whole product. */
export function useAdminLang() {
  const { language, setLanguage } = useLanguage();
  const t = useCallback((hi: string, en: string) => (language === "en" ? en : hi), [language]);
  return { t, language, setLanguage };
}
