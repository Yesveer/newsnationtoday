import { GoogleTranslateWidget } from "@/components/i18n/google-translate-widget";

/** Mounts the page translator on a section of the product.
 *
 *  The cookie that tells Google which language to use is written by the
 *  `beforeInteractive` script in the root layout, so by the time this widget
 *  boots the target language is already decided. */
export function TranslateBootstrap({ skipLanguages }: { skipLanguages?: string[] }) {
  return <GoogleTranslateWidget skipLanguages={skipLanguages} />;
}
