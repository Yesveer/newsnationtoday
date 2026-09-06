"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, MonitorPlay, Search, Video } from "lucide-react";
import { AnimatedLogo } from "@/components/brand/animated-logo";
import { UserMenu } from "@/components/layout/user-menu";
import { LanguageMenu } from "@/components/layout/language-menu";
import { MobileSidebarDrawer } from "@/components/layout/mobile-sidebar-drawer";
import { useLanguage } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { utilityLinks } from "@/config/nav.config";
import { cn } from "@/lib/cn";

const navMeta: Record<string, { icon: typeof Home; motion: string; delay: string; labelKey: TranslationKey }> = {
  home: { icon: Home, motion: "animate-icon-bob", delay: "0s", labelKey: "nav.home" },
  search: { icon: Search, motion: "animate-icon-wiggle", delay: "0.35s", labelKey: "nav.search" },
  videos: { icon: Video, motion: "animate-icon-pulse", delay: "0.7s", labelKey: "nav.videos" },
  watch: { icon: MonitorPlay, motion: "animate-icon-flicker", delay: "1.05s", labelKey: "nav.watch" },
};

export function Masthead() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-bg">
      <div className="mx-auto flex h-full max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <AnimatedLogo />

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {utilityLinks.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const meta = navMeta[link.key] ?? navMeta.home;
            const Icon = meta.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                  active ? "bg-surface-muted text-accent" : "text-text hover:bg-surface-muted hover:text-accent",
                )}
              >
                <Icon className={cn("size-5 shrink-0", meta.motion)} style={{ animationDelay: meta.delay }} />
                {t(meta.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            href="/search"
            aria-label={t("a11y.search")}
            className="flex size-9 items-center justify-center rounded-full text-text transition-colors hover:text-accent lg:hidden"
          >
            <Search className="animate-icon-wiggle size-5" />
          </Link>
          <LanguageMenu />
          <UserMenu />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={t("drawer.open")}
            className="flex size-9 items-center justify-center rounded-full text-text transition-colors hover:text-accent lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <MobileSidebarDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
