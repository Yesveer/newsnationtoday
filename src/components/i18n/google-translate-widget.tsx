"use client";

import Script from "next/script";
import { siteLanguages, SOURCE_LANGUAGE } from "@/config/languages.config";
import { useLanguage } from "@/components/i18n/language-provider";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
          element: string,
        ) => void;
      };
    };
  }
}

const ELEMENT_ID = "google_translate_element";

/** Loads Google's website translator for the reader-facing site only.
 *
 *  The newsroom writes in Hindi, so Google translates *from* Hindi into
 *  whatever the reader picked — English by default. We render our own language
 *  menu in the masthead and keep Google's own widget/banner hidden. */
export function GoogleTranslateWidget({ skipLanguages = [] }: { skipLanguages?: string[] }) {
  const { language } = useLanguage();

  // Some surfaces already have exact wording for a language — the admin portal
  // ships its own Hindi and English strings. Running a machine translation over
  // English chrome turns "Publish" into "Published", so skip it there and let
  // Google handle only the languages we do not write ourselves.
  if (skipLanguages.includes(language)) return null;

  return (
    <>
      <div id={ELEMENT_ID} aria-hidden className="sr-only" />
      <Script id="google-translate-init" strategy="afterInteractive">
        {`window.googleTranslateElementInit = function () {
          if (!window.google || !window.google.translate) return;
          new window.google.translate.TranslateElement(
            {
              pageLanguage: ${JSON.stringify(SOURCE_LANGUAGE)},
              includedLanguages: ${JSON.stringify(siteLanguages.map((language) => language.code).join(","))},
              autoDisplay: false
            },
            ${JSON.stringify(ELEMENT_ID)}
          );
        };`}
      </Script>
      <Script
        id="google-translate-element"
        strategy="afterInteractive"
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      />
    </>
  );
}
