import { cache } from "react";
import { fetchSiteConfig } from "@/lib/api/public";
import { defaultAppearance, type AppearanceSettings } from "@/config/appearance.config";

/** What the newsroom controls from the Appearance and Settings screens. The
 *  shape is the admin portal's own `AppearanceSettings`, plus the contact and
 *  SEO blocks the settings screen edits. */
export interface SiteSettings extends AppearanceSettings {
  contact?: {
    email?: string;
    url?: string;
    social?: Record<string, string>;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    analyticsId?: string;
    indexing?: boolean;
  };
  advanced?: {
    comments?: boolean;
    maintenance?: boolean;
  };
}

/** Reads the live configuration, falling back to the built-in defaults when
 *  the API is unreachable — a missing backend must not blank the site.
 *
 *  Wrapped in `cache` so the root layout and the site layout share one fetch
 *  per request instead of asking the API twice. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const config = await fetchSiteConfig<SiteSettings>();
  if (!config) return defaultAppearance;

  // Merge over the defaults so a config saved before a new setting existed
  // still renders, instead of hitting undefined.
  return {
    ...defaultAppearance,
    ...config,
    brand: { ...defaultAppearance.brand, ...config.brand },
    theme: { ...defaultAppearance.theme, ...config.theme },
    header: { ...defaultAppearance.header, ...config.header },
    hero: { ...defaultAppearance.hero, ...config.hero },
    homepage: { ...defaultAppearance.homepage, ...config.homepage },
    sidebar: { ...defaultAppearance.sidebar, ...config.sidebar },
    rail: { ...defaultAppearance.rail, ...config.rail },
    mobileDock: { ...defaultAppearance.mobileDock, ...config.mobileDock },
    languages: { ...defaultAppearance.languages, ...config.languages },
  };
});
