"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { ChevronDown, HelpCircle, LogIn, MessageSquare, Monitor, Moon, Sun, User } from "lucide-react";
import {
  NavDropdown,
  NavDropdownItem,
  NavDropdownLabel,
  NavDropdownSeparator,
} from "@/components/ui/nav-dropdown";
import { useLanguage } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const emptySubscribe = () => () => {};

const themeOptions: { value: string; icon: typeof Sun; labelKey: TranslationKey }[] = [
  { value: "light", icon: Sun, labelKey: "menu.theme.light" },
  { value: "dark", icon: Moon, labelKey: "menu.theme.dark" },
  { value: "system", icon: Monitor, labelKey: "menu.theme.system" },
];

export function UserMenu() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <NavDropdown
      label={t("menu.account")}
      trigger={
        <>
          <span className="flex size-6 items-center justify-center rounded-full bg-surface-muted">
            <User className="size-3.5" />
          </span>
          <ChevronDown className="size-3.5" />
        </>
      }
    >
      <div className="px-2.5 py-2">
        <p className="text-sm font-semibold text-text">{t("menu.account")}</p>
        <p className="text-xs text-text-muted">{t("menu.guest")}</p>
      </div>

      <NavDropdownItem href="/login">
        <LogIn className="size-4" /> {t("menu.login")}
      </NavDropdownItem>

      <NavDropdownSeparator />

      <NavDropdownLabel>{t("menu.theme")}</NavDropdownLabel>
      {themeOptions.map((option) => (
        <NavDropdownItem
          key={option.value}
          active={mounted && theme === option.value}
          onClick={() => setTheme(option.value)}
        >
          <option.icon className="size-4" /> {t(option.labelKey)}
        </NavDropdownItem>
      ))}

      <NavDropdownSeparator />

      <NavDropdownItem href="/faq">
        <HelpCircle className="size-4" /> {t("menu.faq")}
      </NavDropdownItem>
      <NavDropdownItem href="/contact">
        <MessageSquare className="size-4" /> {t("menu.feedback")}
      </NavDropdownItem>
    </NavDropdown>
  );
}
