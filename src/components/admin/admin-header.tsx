"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  IconLanguage,
  IconLogout,
  IconMoon,
  IconSearch,
  IconSun,
  IconUserCircle,
} from "@tabler/icons-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAdminAuth, useAdminSession } from "@/components/admin/admin-session";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { RoleBadge } from "@/components/admin/role-badge";
import { AdminCommandMenu } from "@/components/admin/admin-command-menu";
import { findLanguage, siteLanguages } from "@/config/languages.config";

const segmentLabels: Record<string, [hi: string, en: string]> = {
  admin: ["एडमिन", "Admin"],
  news: ["खबरें", "News"],
  new: ["नई खबर", "New story"],
  review: ["रिव्यू क्यू", "Review queue"],
  videos: ["वीडियो", "Videos"],
  media: ["मीडिया", "Media"],
  appearance: ["अपीयरेंस", "Appearance"],
  categories: ["कैटेगरी", "Categories"],
  topics: ["टॉपिक हब", "Topic hubs"],
  settings: ["सेटिंग्स", "Settings"],
  requests: ["अप्रूवल रिक्वेस्ट", "Approvals"],
  users: ["यूज़र", "Users"],
  "audit-logs": ["ऑडिट लॉग", "Audit logs"],
  profile: ["प्रोफ़ाइल", "Profile"],
};

export function AdminHeader() {
  const pathname = usePathname();
  const { user, role } = useAdminSession();
  const { signOut } = useAdminAuth();
  const router = useRouter();
  const { t, language, setLanguage } = useAdminLang();
  const currentLanguage = findLanguage(language) ?? siteLanguages[0];
  const { resolvedTheme, setTheme } = useTheme();

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((segment, index) => {
    const label = segmentLabels[segment];
    return {
      href: `/${segments.slice(0, index + 1).join("/")}`,
      // Anything that isn't a known segment is a record id — show what the
      // page actually is rather than "art_desh_1".
      label: label ? t(label[0], label[1]) : t("एडिट", "Edit"),
      isLast: index === segments.length - 1,
    };
  });

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-bg/85 px-3 backdrop-blur-xl sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 !h-5" />

      <Breadcrumb className="hidden min-w-0 sm:block">
        <BreadcrumbList>
          {/* The separator renders its own <li>, so it has to sit beside the
              item, never inside it — nesting them breaks hydration. */}
          {crumbs.map((crumb) => (
            <Fragment key={crumb.href}>
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage className="max-w-[26ch] truncate font-semibold">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {crumb.isLast ? null : <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1.5">
        <AdminCommandMenu
          trigger={
            <button
              type="button"
              className="hidden items-center gap-2 rounded-md border border-border bg-surface-muted/60 px-2.5 py-1.5 text-xs text-text-muted transition-colors hover:border-accent/50 hover:text-text md:flex"
            >
              <IconSearch className="size-3.5" stroke={1.8} />
              {t("खबर, यूज़र, पेज खोजें", "Search news, users, pages")}
              <kbd className="ml-6 rounded border border-border bg-bg px-1.5 py-0.5 font-sans text-[10px]">⌘K</kbd>
            </button>
          }
          mobileTrigger={
            <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("खोजें", "Search")}>
              <IconSearch className="size-4.5" stroke={1.8} />
            </Button>
          }
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 px-2" aria-label={t("भाषा बदलें", "Change language")}>
              <IconLanguage className="size-4.5" stroke={1.8} />
              <span className="notranslate hidden text-[12.5px] font-medium sm:inline" translate="no">
                {currentLanguage.label}
              </span>
            </Button>
          </DropdownMenuTrigger>
          {/* `notranslate` on the names: a list where "ਪੰਜਾਬੀ" has been machine
              translated into the language you are already reading is useless. */}
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <IconLanguage className="size-3.5" /> {t("भाषा", "Language")}
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value)}>
              {siteLanguages.map((option) => (
                <DropdownMenuRadioItem key={option.code} value={option.code} className="text-[13px]">
                  <span className="notranslate flex flex-1 items-center gap-2" translate="no">
                    <span className="w-6 text-[10px] font-bold tracking-wide uppercase opacity-60">
                      {option.code}
                    </span>
                    <span className="flex-1">{option.label}</span>
                    <span className="text-[11px] text-text-muted">{option.englishLabel}</span>
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <p className="px-2 pt-1 pb-1.5 text-[10.5px] leading-snug text-text-muted">
              {t(
                "अंग्रेज़ी और हिंदी के अलावा बाकी भाषाएं Google अनुवाद से आती हैं।",
                "Languages other than English and Hindi are machine-translated by Google.",
              )}
            </p>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          aria-label={t("थीम बदलें", "Toggle theme")}
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <IconSun className="size-4.5 dark:hidden" stroke={1.8} />
          <IconMoon className="hidden size-4.5 dark:block" stroke={1.8} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex items-center gap-2 rounded-full pl-1 outline-none">
              <Avatar className="size-8">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="text-xs">{user.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="text-sm font-semibold">{user.name}</span>
              <span className="text-[11px] font-normal text-text-muted">{user.email}</span>
              <RoleBadge role={role} className="mt-1" />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/profile">
                <IconUserCircle className="size-4" /> {t("प्रोफ़ाइल", "Profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                await signOut();
                router.replace("/login");
              }}
            >
              <IconLogout className="size-4" /> {t("लॉग आउट", "Log out")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
