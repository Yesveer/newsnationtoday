"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconAward,
  IconBallFootball,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandX,
  IconBrandYoutube,
  IconBriefcase,
  IconBuildingBank,
  IconChartLine,
  IconCricket,
  IconDeviceMobile,
  IconFlame,
  IconMapPin,
  IconMasksTheater,
  IconMovie,
  IconSchool,
  IconShirt,
  IconSparkles,
  IconStars,
  IconSunHigh,
  IconWorld,
  IconZoomCheck,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import { categoriesConfig } from "@/config/categories.config";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/cn";

type IconComponent = ComponentType<{ className?: string; stroke?: number }>;

const categoryIcons: Record<string, IconComponent> = {
  desh: IconBuildingBank,
  rajya: IconMapPin,
  videsh: IconWorld,
  rajniti: IconAward,
  cricket: IconCricket,
  khel: IconBallFootball,
  manoranjan: IconMovie,
  vyapar: IconChartLine,
  tech: IconDeviceMobile,
  tejaswini: IconSparkles,
  investigation: IconZoomCheck,
  khaas: IconStars,
  originals: IconMasksTheater,
  jobs: IconSchool,
  lifestyle: IconShirt,
  "jeevan-mantra": IconSunHigh,
  opinion: IconBriefcase,
  rashifal: IconStars,
};

const socialLinks = [
  { label: "Twitter", href: siteConfig.social.twitter, icon: IconBrandX, color: "#1DA1F2" },
  { label: "Facebook", href: siteConfig.social.facebook, icon: IconBrandFacebook, color: "#1877F2" },
  { label: "Instagram", href: siteConfig.social.instagram, icon: IconBrandInstagram, color: "#E4405F" },
  { label: "YouTube", href: siteConfig.social.youtube, icon: IconBrandYoutube, color: "#FF0000" },
];

/** Soft tinted tile with the category colour carried by the glyph itself. */
function IconTile({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
      style={{ backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
    >
      {children}
    </span>
  );
}

export function CategoryLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const activeSlug = pathname.split("/")[1];

  return (
    <nav className={cn("flex flex-col gap-0.5", className)}>
      <Link
        href="/"
        className={cn(
          "group flex items-center gap-3 rounded-xl px-2.5 py-2 text-[15px] font-semibold transition-colors",
          pathname === "/" ? "bg-surface-muted text-text" : "text-text hover:bg-surface-muted",
        )}
      >
        <IconTile color="#EF4444">
          <IconFlame className="size-[19px]" stroke={1.7} />
        </IconTile>
        <span className="truncate">{t("sidebar.topNews")}</span>
      </Link>

      {categoriesConfig
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((category) => {
          const Icon = categoryIcons[category.slug] ?? IconFlame;
          const active = category.slug === activeSlug;
          return (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-2.5 py-2 text-[15px] font-semibold transition-colors",
                active ? "bg-surface-muted text-text" : "text-text hover:bg-surface-muted",
              )}
            >
              <IconTile color={category.color}>
                <Icon className="size-[19px]" stroke={1.7} />
              </IconTile>
              <span className="truncate">{language === "en" ? category.nameEn : category.name}</span>
              {category.isNew && (
                <span className="ml-auto rounded bg-live px-1.5 py-0.5 text-[9px] font-bold text-live-foreground">
                  NEW
                </span>
              )}
            </Link>
          );
        })}
    </nav>
  );
}

export function CategorySidebar({ className }: { className?: string }) {
  const { t } = useLanguage();

  return (
    <aside className={cn("sticky top-14 flex h-fit max-h-[calc(100vh-3.5rem)] flex-col gap-5 overflow-y-auto py-4", className)}>
      <CategoryLinks />

      <div className="border-t border-border pt-4">
        <p className="px-2.5 pb-2 text-xs font-semibold tracking-wide text-text-muted uppercase">
          {t("sidebar.follow")}
        </p>
        <div className="flex items-center gap-2 px-2.5">
          {socialLinks.map(({ label, href, icon: Icon, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="flex size-9 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110"
              style={{ backgroundColor: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
