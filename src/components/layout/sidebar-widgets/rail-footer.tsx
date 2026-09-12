"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const links: { labelKey: TranslationKey; href: string }[] = [
  { labelKey: "footer.about", href: "/about" },
  { labelKey: "footer.contact", href: "/contact" },
  { labelKey: "footer.advertise", href: "/contact" },
  { labelKey: "footer.privacy", href: "/about" },
  { labelKey: "footer.terms", href: "/about" },
  { labelKey: "menu.faq", href: "/faq" },
];

/** Footer links live in the right rail on wide screens, the way news portals do. */
export function RailFooter() {
  const { t } = useLanguage();

  return (
    <div className="border-t border-border pt-4">
      <nav className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-text-muted">
        {links.map((link) => (
          <Link key={link.labelKey} href={link.href} className="hover:text-accent">
            {t(link.labelKey)}
          </Link>
        ))}
      </nav>
      <p className="mt-3 text-xs leading-relaxed text-text-muted">
        © {new Date().getFullYear()} {siteConfig.name}. {t("footer.rights")}
      </p>
    </div>
  );
}
