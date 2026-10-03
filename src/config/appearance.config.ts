import { siteConfig } from "@/config/site";
import { siteLanguages, SOURCE_LANGUAGE, DEFAULT_LANGUAGE } from "@/config/languages.config";

/** Everything on the public site that an admin can change from the portal.
 *  The forms in `/admin/appearance` edit exactly this shape, so wiring the Go
 *  backend later is a matter of loading/saving this object. */
export interface NavItemSetting {
  id: string;
  label: string;
  href: string;
  icon: string;
  visible: boolean;
}

export interface HomeSectionSetting {
  id: string;
  label: string;
  description: string;
  visible: boolean;
}

/** One language offered on the website, as the admin portal stores it. */
export interface LanguageSetting {
  /** Google Translate language code — hi, en, mr, pa, ur, ta… */
  code: string;
  /** Shown in the menu, in the language's own script. */
  label: string;
  englishLabel: string;
  /** Right-to-left scripts (Urdu, Arabic) flip the page direction. */
  rtl?: boolean;
  enabled: boolean;
}

export interface LanguageSettings {
  /** What the newsroom writes in — everything is translated *from* this. */
  source: string;
  /** What a first-time visitor sees before choosing anything. */
  default: string;
  items: LanguageSetting[];
}

export interface AppearanceSettings {
  brand: {
    siteName: string;
    tagline: string;
    logoUrl: string;
    logoSize: number;
    showNameUnderLogo: boolean;
    animateLogo: boolean;
  };
  theme: {
    accent: string;
    live: string;
    defaultMode: "light" | "dark" | "system";
    fontScale: number;
    radius: number;
  };
  header: {
    height: number;
    sticky: boolean;
    glass: boolean;
    showLanguageSwitch: boolean;
    showSearch: boolean;
    navItems: NavItemSetting[];
  };
  hero: {
    enabled: boolean;
    autoplaySeconds: number;
    slideCount: number;
    kenBurns: boolean;
    showLiveBadge: boolean;
  };
  homepage: {
    sections: HomeSectionSetting[];
    trendingChips: boolean;
    cardsPerRow: number;
  };
  sidebar: {
    showCategoryIcons: boolean;
    showSocialLinks: boolean;
    showNewBadges: boolean;
  };
  rail: {
    trendingWidget: boolean;
    videoWidget: boolean;
    autoScrollTrending: boolean;
    footerInRail: boolean;
  };
  mobileDock: {
    enabled: boolean;
    glass: boolean;
    iconSize: number;
    items: NavItemSetting[];
  };
  languages: LanguageSettings;
}

export const defaultAppearance: AppearanceSettings = {
  brand: {
    siteName: siteConfig.name,
    tagline: siteConfig.tagline,
    logoUrl: "/logo-nnt.png",
    logoSize: 34,
    showNameUnderLogo: true,
    animateLogo: true,
  },
  theme: {
    accent: "#FF5C00",
    live: "#E11D2E",
    defaultMode: "system",
    fontScale: 100,
    radius: 8,
  },
  header: {
    height: 56,
    sticky: true,
    glass: true,
    showLanguageSwitch: true,
    showSearch: true,
    navItems: [
      { id: "home", label: "होम", href: "/", icon: "home", visible: true },
      { id: "search", label: "सर्च", href: "/search", icon: "search", visible: true },
      { id: "videos", label: "वीडियो", href: "/videos", icon: "video", visible: true },
      { id: "watch", label: "वॉच", href: "/watch", icon: "watch", visible: true },
    ],
  },
  hero: {
    enabled: true,
    autoplaySeconds: 6,
    slideCount: 5,
    kenBurns: true,
    showLiveBadge: true,
  },
  homepage: {
    sections: [
      { id: "top-stories", label: "टॉप स्टोरीज़", description: "हीरो के नीचे बड़े कार्ड", visible: true },
      { id: "latest", label: "ताज़ा खबरें", description: "रिवर्स-क्रोनोलॉजिकल फीड", visible: true },
      { id: "category-rows", label: "कैटेगरी रो", description: "हर कैटेगरी की अलग पंक्ति", visible: true },
      { id: "video-strip", label: "वीडियो स्ट्रिप", description: "हॉरिज़ॉन्टल वीडियो कार्ड", visible: true },
      { id: "photo-gallery", label: "फोटो गैलरी", description: "ग्रिड गैलरी सेक्शन", visible: false },
    ],
    trendingChips: true,
    cardsPerRow: 3,
  },
  sidebar: {
    showCategoryIcons: true,
    showSocialLinks: true,
    showNewBadges: true,
  },
  rail: {
    trendingWidget: true,
    videoWidget: true,
    autoScrollTrending: true,
    footerInRail: true,
  },
  mobileDock: {
    enabled: true,
    glass: true,
    iconSize: 28,
    items: [
      { id: "home", label: "होम", href: "/", icon: "home", visible: true },
      { id: "search", label: "सर्च", href: "/search", icon: "search", visible: true },
      { id: "videos", label: "वीडियो", href: "/videos", icon: "video", visible: true },
      { id: "watch", label: "वॉच", href: "/watch", icon: "watch", visible: true },
    ],
  },
  languages: {
    source: SOURCE_LANGUAGE,
    default: DEFAULT_LANGUAGE,
    items: siteLanguages.map((language) => ({
      code: language.code,
      label: language.label,
      englishLabel: language.englishLabel,
      rtl: language.rtl ?? false,
      enabled: true,
    })),
  },
};
