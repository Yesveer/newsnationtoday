"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const footerLinks: { labelKey: TranslationKey; href: string }[] = [
  { labelKey: "footer.about", href: "/about" },
  { labelKey: "footer.contact", href: "/contact" },
  { labelKey: "footer.advertise", href: "/contact" },
  { labelKey: "footer.privacy", href: "/about" },
  { labelKey: "footer.terms", href: "/about" },
];

export function Footer({ className }: { className?: string }) {
  const { t } = useLanguage();

  return (
    <footer className={cn("border-t border-border bg-surface py-6", className)}>
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-3 px-4 text-center sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-text-muted">
          {footerLinks.map((link) => (
            <Link key={link.labelKey} href={link.href} className="hover:text-accent">
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} {siteConfig.name}. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
