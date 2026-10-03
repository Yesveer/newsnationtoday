"use client";

import { useEffect } from "react";
import Script from "next/script";
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

/** Google leaves a spinner behind.
 *
 *  Signing in goes /login → /admin as a client-side navigation. The translator
 *  runs on the public login page; the admin skips it, so React unmounts the
 *  widget — but the loading spinner Google appended to <body> is not React's
 *  to remove, so it sits in the top-left corner turning forever until a hard
 *  refresh. Its classes are obfuscated and share one prefix, which is the only
 *  handle there is.
 */
const SPINNER_SELECTOR = '[class*="VIpgJd-ZVi9od-aZ2wEe"], .goog-te-spinner-pos';

function removeSpinner() {
  for (const node of document.querySelectorAll(SPINNER_SELECTOR)) {
    node.remove();
  }
}

/** Puts the page back into its own language, in place.
 *
 *  Google's hidden language <select> is the only supported way to undo a
 *  translation without reloading — setting it back to the source and firing
 *  `change` restores the original text. Needed because the admin must not be
 *  machine-translated when it already ships exact wording for the language. */
function restoreOriginal(source: string) {
  const combo = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
  if (!combo || combo.value === "" || combo.value === source) return false;
  combo.value = source;
  combo.dispatchEvent(new Event("change"));
  return true;
}

/** Loads Google's website translator.
 *
 *  The newsroom writes in Hindi, so Google translates *from* Hindi into
 *  whatever the reader picked. We render our own language menu and keep
 *  Google's widget, banner and spinner hidden. */
export function GoogleTranslateWidget({ skipLanguages = [] }: { skipLanguages?: string[] }) {
  const { language, sourceLanguage } = useLanguage();

  // Some surfaces already have exact wording for a language — the admin portal
  // ships its own Hindi and English strings. Running a machine translation over
  // English chrome turns "Publish" into "Published", so skip it there and let
  // Google handle only the languages we do not write ourselves.
  const skip = skipLanguages.includes(language);

  useEffect(() => {
    if (!skip) return;
    // Arriving from a translated page: undo it and sweep up what Google left.
    restoreOriginal(sourceLanguage);
    removeSpinner();
    // Google re-inserts the spinner while it restores, so sweep again after.
    const timer = setTimeout(removeSpinner, 1200);
    return () => clearTimeout(timer);
  }, [skip, sourceLanguage]);

  if (skip) return null;

  // The init callback and the language list are defined by the
  // `beforeInteractive` bootstrap in the root layout, so they exist before
  // this script can call them.
  return (
    <>
      <div id={ELEMENT_ID} aria-hidden className="sr-only" />
      <Script
        id="google-translate-element"
        strategy="afterInteractive"
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      />
    </>
  );
}
