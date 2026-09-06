"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Home, MonitorPlay, Search, Video } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { utilityLinks } from "@/config/nav.config";
import { cn } from "@/lib/cn";

const tabMeta: Record<string, { icon: typeof Home; motion: string; labelKey: TranslationKey }> = {
  home: { icon: Home, motion: "animate-icon-bob", labelKey: "nav.home" },
  search: { icon: Search, motion: "animate-icon-wiggle", labelKey: "nav.search" },
  videos: { icon: Video, motion: "animate-icon-pulse", labelKey: "nav.videos" },
  watch: { icon: MonitorPlay, motion: "animate-icon-flicker", labelKey: "nav.watch" },
};

/**
 * Floating icon-only glass dock for phones — translucent enough that the page
 * shows through, with a springy pill sliding to the active tab. Labels are
 * dropped for the iOS-dock look, so each icon carries an aria-label instead.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:hidden">
      <nav
        aria-label={t("nav.home")}
        className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-full border border-black/10 bg-surface/45 shadow-[0_14px_45px_-10px_rgb(0_0_0/0.5)] backdrop-blur-2xl backdrop-saturate-200 dark:border-white/15 dark:bg-surface/30"
      >
        {/* specular sheen along the top edge — the glass cue */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent dark:from-white/15"
        />

        <ul className="relative grid grid-cols-4 gap-1 p-2">
          {utilityLinks.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const meta = tabMeta[link.key] ?? tabMeta.home;
            const Icon = meta.icon;

            return (
              <li key={link.href} className="relative">
                {active && (
                  <motion.span
                    layoutId="dock-pill"
                    className="absolute inset-0 rounded-full bg-accent/20 ring-1 ring-accent/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Link
                  href={link.href}
                  aria-label={t(meta.labelKey)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-12 w-full items-center justify-center rounded-full transition-transform active:scale-90",
                    active ? "text-accent" : "text-text-muted",
                  )}
                >
                  <Icon className={cn("size-7", active && meta.motion)} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
