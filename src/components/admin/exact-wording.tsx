"use client";

import { useLanguage } from "@/components/i18n/language-provider";

/** Keeps a translator's hands off the portal when it already has the words.
 *
 *  The admin ships exact Hindi and English, so for those two languages no
 *  machine translation should run — not Google's widget (which we already
 *  skip) and not the browser's own "Translate this page", which we cannot
 *  skip but can opt out of with `translate="no"`.
 *
 *  This is not only about wording. A translator replaces text nodes with
 *  `<font>` wrappers, and React then updates a tree that has moved under it:
 *  that is what made a dropdown show its old value and the new one stacked
 *  together. Opting out removes the whole class of problem on these screens.
 *
 *  For any other language the attribute is dropped, so the widget can do its
 *  job as before. */
export function ExactWording({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const exact = language === "hi" || language === "en";

  return (
    <div
      className={exact ? "notranslate contents" : "contents"}
      translate={exact ? "no" : undefined}
    >
      {children}
    </div>
  );
}
