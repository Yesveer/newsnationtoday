"use client";

import Image from "next/image";
import { IconBolt, IconHome, IconPlayerPlay, IconSearch, IconVideo } from "@tabler/icons-react";
import type { SiteSettings } from "@/lib/data/get-site-config";
import { useAdminLang } from "@/components/admin/use-admin-lang";

const previewIcons: Record<string, typeof IconHome> = {
  home: IconHome,
  search: IconSearch,
  video: IconVideo,
  watch: IconPlayerPlay,
};

/** A miniature of the public site that reacts to every control on the left,
 *  so an admin can see the change before saving it. */
export function AppearancePreview({ settings }: { settings: SiteSettings }) {
  const { t } = useAdminLang();
  const { brand, theme, header, hero, homepage } = settings;

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-bg"
      style={{ ["--preview-accent" as string]: theme.accent }}
    >
      <div
        className="flex items-center gap-3 border-b border-border px-3"
        style={{ height: Math.max(40, header.height * 0.8) }}
      >
        <div className="flex flex-col items-center gap-0.5">
          <span className="relative block" style={{ width: brand.logoSize * 2.2, height: brand.logoSize * 0.75 }}>
            <Image src={brand.logoUrl} alt="logo" fill className="object-contain" sizes="120px" />
          </span>
          {brand.showNameUnderLogo ? (
            <span className="text-[6px] font-bold tracking-wider text-text uppercase">{brand.siteName}</span>
          ) : null}
        </div>
        <nav className="flex items-center gap-2.5">
          {header.navItems
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = previewIcons[item.icon] ?? IconHome;
              return (
                <span key={item.id} className="flex flex-col items-center gap-0.5">
                  <Icon className="size-3" style={{ color: theme.accent }} stroke={2} />
                  <span className="text-[6.5px] text-text-muted">{item.label}</span>
                </span>
              );
            })}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          {header.showSearch ? (
            <span className="h-3 w-12 rounded-full bg-surface-muted" />
          ) : null}
          {header.showLanguageSwitch ? (
            <span className="rounded border border-border px-1 text-[6px] text-text-muted">हिं</span>
          ) : null}
          <span className="size-3 rounded-full bg-surface-muted" />
        </div>
      </div>

      {hero.enabled ? (
        <div className="relative h-24 w-full overflow-hidden bg-surface-muted">
          <Image
            src="https://picsum.photos/id/1024/800/400"
            alt=""
            fill
            className="object-cover"
            sizes="400px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute right-2 bottom-2 left-2 space-y-1">
            {hero.showLiveBadge ? (
              <span
                className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[6px] font-bold text-white"
                style={{ backgroundColor: theme.live }}
              >
                <IconBolt className="size-2" /> {t("लाइव", "Live")}
              </span>
            ) : null}
            <p className="text-[9px] leading-tight font-bold text-white">
              {t(
                `हीरो स्लाइडर — ${hero.slideCount} स्लाइड, हर ${hero.autoplaySeconds}s`,
                `Hero slider — ${hero.slideCount} slides, every ${hero.autoplaySeconds}s`,
              )}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex gap-2 p-2">
        <div className="hidden w-16 shrink-0 flex-col gap-1 sm:flex">
          {[t("देश", "National"), t("राज्य", "States"), t("खेल", "Sports"), t("बिजनेस", "Business")].map((label) => (
            <span key={label} className="flex items-center gap-1 rounded px-1 py-0.5 text-[7px] text-text-muted">
              <span className="size-2 rounded" style={{ backgroundColor: `${theme.accent}33` }} />
              {label}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          {homepage.trendingChips ? (
            <div className="mb-1.5 flex gap-1">
              {[t("ट्रेंडिंग", "Trending"), t("चुनाव", "Election"), t("क्रिकेट", "Cricket")].map((chip) => (
                <span key={chip} className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[6.5px] text-text-muted">
                  #{chip}
                </span>
              ))}
            </div>
          ) : null}
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${homepage.cardsPerRow}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: homepage.cardsPerRow }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded border border-border">
                <span className="block h-8 w-full bg-surface-muted" />
                <span className="block px-1 py-1">
                  <span className="mb-0.5 block h-1 w-8 rounded" style={{ backgroundColor: theme.accent }} />
                  <span className="block h-1 w-full rounded bg-surface-muted" />
                  <span className="mt-0.5 block h-1 w-2/3 rounded bg-surface-muted" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {settings.mobileDock.enabled ? (
        <div className="flex justify-center pb-2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface/80 px-2.5 py-1 backdrop-blur">
            {settings.mobileDock.items
              .filter((item) => item.visible)
              .map((item) => {
                const Icon = previewIcons[item.icon] ?? IconHome;
                return (
                  <Icon
                    key={item.id}
                    className="size-2.5"
                    style={{ width: settings.mobileDock.iconSize / 9, height: settings.mobileDock.iconSize / 9 }}
                  />
                );
              })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
