"use client";

import { ChevronDown, Globe } from "lucide-react";
import { NavDropdown, NavDropdownItem, NavDropdownLabel } from "@/components/ui/nav-dropdown";
import { useLanguage } from "@/components/i18n/language-provider";
import { languages } from "@/lib/i18n/dictionary";

export function LanguageMenu() {
  const { language, setLanguage, t } = useLanguage();
  const current = languages.find((option) => option.value === language);

  return (
    <NavDropdown
      label={t("menu.language")}
      panelClassName="min-w-44"
      trigger={
        <>
          <Globe className="size-4" />
          {/* Label drops on very narrow phones so the header cluster can't overflow. */}
          <span className="text-sm font-medium max-[380px]:hidden">{current?.label}</span>
          <ChevronDown className="size-3.5" />
        </>
      }
    >
      <NavDropdownLabel>{t("menu.language")}</NavDropdownLabel>
      {languages.map((option) => (
        <NavDropdownItem
          key={option.value}
          active={language === option.value}
          onClick={() => setLanguage(option.value)}
        >
          <span className="w-4 text-center text-xs font-bold">{option.value === "hi" ? "अ" : "A"}</span>
          {option.label}
        </NavDropdownItem>
      ))}
    </NavDropdown>
  );
}
