"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Cpu, Film, Flame, Landmark, MapPin, Trophy } from "lucide-react";
import { IconBrandFacebook, IconBrandInstagram, IconBrandX, IconBrandYoutube } from "@tabler/icons-react";
import { categoriesConfig } from "@/config/categories.config";
import { siteConfig } from "@/config/site";
import { AdSlot } from "@/components/layout/sidebar-widgets/ad-slot";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/cn";

const categoryIcons: Record<string, typeof Flame> = {
  desh: Landmark,
  rajya: MapPin,
  rajniti: Flame,
  khel: Trophy,
  manoranjan: Film,
  vyapar: Briefcase,
  tech: Cpu,
};

const socialLinks = [
  { label: "Twitter", href: siteConfig.social.twitter, icon: IconBrandX, color: "#1DA1F2" },
  { label: "Facebook", href: siteConfig.social.facebook, icon: IconBrandFacebook, color: "#1877F2" },
  { label: "Instagram", href: siteConfig.social.instagram, icon: IconBrandInstagram, color: "#E4405F" },
  { label: "YouTube", href: siteConfig.social.youtube, icon: IconBrandYoutube, color: "#FF0000" },
];

export function CategoryLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const activeSlug = pathname.split("/")[1];

  return (
    <nav className={cn("flex flex-col gap-0.5", className)}>
      {categoriesConfig
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((category, index) => {
          const Icon = categoryIcons[category.slug] ?? Flame;
          const active = category.slug === activeSlug;
          return (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors",
                active ? "bg-surface-muted text-text" : "text-text hover:bg-surface-muted",
              )}
            >
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `color-mix(in oklab, ${category.color} 20%, transparent)` }}
              >
                <Icon
                  className="animate-icon-float size-4"
                  style={{ color: category.color, animationDelay: `${index * 0.28}s` }}
                />
              </span>
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
        <p className="px-2.5 pb-2 text-[11px] font-semibold tracking-wide text-text-muted uppercase">
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

      <AdSlot />
    </aside>
  );
}
