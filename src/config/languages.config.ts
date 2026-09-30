/** Languages the reader-facing site offers.
 *
 *  Adding one later is a single line here — the header menu, the Google
 *  Translate widget and the stored preference all read from this list.
 *  `code` must be a Google Translate language code (hi, mr, pa, ur, ta, te, bn…).
 */
export interface SiteLanguage {
  code: string;
  /** Shown in the menu, in the language's own script. */
  label: string;
  englishLabel: string;
  /** Right-to-left scripts (Urdu) need the page direction flipped. */
  rtl?: boolean;
}

export const siteLanguages: SiteLanguage[] = [
  { code: "en", label: "English", englishLabel: "English" },
  { code: "hi", label: "हिंदी", englishLabel: "Hindi" },
  { code: "mr", label: "मराठी", englishLabel: "Marathi" },
  { code: "pa", label: "ਪੰਜਾਬੀ", englishLabel: "Punjabi" },
  { code: "ur", label: "اردو", englishLabel: "Urdu", rtl: true },
];

/** The language the newsroom actually writes in — Google translates *from* this. */
export const SOURCE_LANGUAGE = "hi";

/** What a first-time visitor sees before they pick anything. */
export const DEFAULT_LANGUAGE = "en";

export function findLanguage(code: string): SiteLanguage | undefined {
  return siteLanguages.find((language) => language.code === code);
}

export function isSupportedLanguage(code: string | null): code is string {
  return code !== null && siteLanguages.some((language) => language.code === code);
}
