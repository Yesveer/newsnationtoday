"use client";

import { ChevronDown, Globe } from "lucide-react";
import { NavDropdown, NavDropdownItem, NavDropdownLabel } from "@/components/ui/nav-dropdown";
import { useLanguage } from "@/components/i18n/language-provider";
import { findLanguage, siteLanguages } from "@/config/languages.config";

/** Reader-facing language switch. English and Hindi use the site's own strings;
 *  the rest are produced by the Google translator mounted in the site layout.
 *
 *  Every language *name* carries `notranslate`: a list where "ਪੰਜਾਬੀ" has been
 *  machine-translated into the language you're already reading is useless — the
 *  point of this menu is to show each option in its own script, always. */
export function LanguageMenu() {
  const { language, setLanguage, t } = useLanguage();
  const current = findLanguage(language) ?? siteLanguages[0];

  return (
    <NavDropdown
      label={t("menu.language")}
      panelClassName="min-w-52"
      trigger={
        <>
          <Globe className="size-4" />
          {/* Label drops on very narrow phones so the header cluster can't overflow. */}
          <span className="notranslate text-sm font-medium max-[380px]:hidden" translate="no">
            {current.label}
          </span>
          <ChevronDown className="size-3.5" />
        </>
      }
    >
      <NavDropdownLabel>{t("menu.language")}</NavDropdownLabel>
      {siteLanguages.map((option) => (
        <NavDropdownItem
          key={option.code}
          active={language === option.code}
          onClick={() => setLanguage(option.code)}
        >
          <span className="notranslate flex flex-1 items-center gap-2.5" translate="no">
            <span className="w-7 shrink-0 text-center text-[10px] font-bold tracking-wide uppercase opacity-60">
              {option.code}
            </span>
            <span className="flex-1">{option.label}</span>
            <span className="text-[11px] text-text-muted">{option.englishLabel}</span>
          </span>
        </NavDropdownItem>
      ))}
      <p className="px-3 pt-1.5 pb-2 text-[10.5px] leading-snug text-text-muted">
        {t("menu.languageNote")}
      </p>
    </NavDropdown>
  );
}
