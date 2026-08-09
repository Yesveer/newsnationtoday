"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Cpu,
  Film,
  Flame,
  Landmark,
  MapPin,
  Trophy,
} from "lucide-react";
import { IconBrandFacebook, IconBrandInstagram, IconBrandX, IconBrandYoutube } from "@tabler/icons-react";
import { categoriesConfig } from "@/config/categories.config";
import { siteConfig } from "@/config/site";
import { AdSlot } from "@/components/layout/sidebar-widgets/ad-slot";
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
  { label: "Twitter", href: siteConfig.social.twitter, icon: IconBrandX },
  { label: "Facebook", href: siteConfig.social.facebook, icon: IconBrandFacebook },
  { label: "Instagram", href: siteConfig.social.instagram, icon: IconBrandInstagram },
  { label: "YouTube", href: siteConfig.social.youtube, icon: IconBrandYoutube },
];

export function CategoryLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  const activeSlug = pathname.split("/")[1];

  return (
    <nav className={cn("flex flex-col", className)}>
      {categoriesConfig
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((category) => {
          const Icon = categoryIcons[category.slug] ?? Flame;
          const active = category.slug === activeSlug;
          return (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-surface-muted text-accent" : "text-text hover:bg-surface-muted",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {category.name}
            </Link>
          );
        })}
    </nav>
  );
}

export function CategorySidebar({ className }: { className?: string }) {
  return (
    <aside className={cn("sticky top-16 flex h-fit max-h-[calc(100vh-4rem)] flex-col gap-6 overflow-y-auto py-4", className)}>
      <CategoryLinks />

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        {socialLinks.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface-muted hover:text-accent"
          >
            <Icon className="size-4" /> {label}
          </a>
        ))}
      </div>

      <AdSlot />
    </aside>
  );
}
