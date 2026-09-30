"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, MonitorPlay, Search, Video } from "lucide-react";
import { AnimatedLogo } from "@/components/brand/animated-logo";
import { UserMenu } from "@/components/layout/user-menu";
import { LanguageMenu } from "@/components/layout/language-menu";
import { useSiteSettings } from "@/components/site/site-settings-provider";
import { MobileSidebarDrawer } from "@/components/layout/mobile-sidebar-drawer";
import { useLanguage } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";
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
  const { header } = useSiteSettings();

  // Which links appear, and in what order, is whatever the Appearance screen
  // saved; the static config is the fallback shape for their icons.
  const links = header.navItems.filter((item) => item.visible);

  return (
    <>
      {/* The drawer must stay OUTSIDE this header: the header's backdrop-filter
          makes it the containing block for fixed children, which would otherwise
          trap the drawer inside the 56px-tall bar instead of the viewport. */}
      {/* Height, stickiness and the glass effect all come from the Appearance
          screen, so the newsroom can tune the header without a deploy. */}
      <header
        className={cn(
          "z-40 border-b border-border",
          header.sticky && "sticky top-0",
          header.glass ? "bg-bg/80 backdrop-blur-xl backdrop-saturate-150" : "bg-bg",
        )}
        style={{ height: header.height }}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <AnimatedLogo />

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {links.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              const meta = navMeta[link.id] ?? navMeta.home;
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
                  {navMeta[link.id] ? t(meta.labelKey) : link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            {header.showLanguageSwitch ? <LanguageMenu /> : null}
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
      </header>

      <MobileSidebarDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
