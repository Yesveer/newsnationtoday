"use client";

import { SafeImage as Image } from "@/components/ui/safe-image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronRight, IconCircleFilled, IconExternalLink } from "@tabler/icons-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { adminNavGroups } from "@/config/admin-nav.config";
import { canAny } from "@/lib/admin/permissions";
import { useAdminSession } from "@/components/admin/admin-session";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { RoleBadge } from "@/components/admin/role-badge";
import { AdminIcon } from "@/components/admin/admin-icon";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { useSidebarBadges } from "@/components/admin/use-sidebar-badges";

export function AppSidebar() {
  const badges = useSidebarBadges();
  const pathname = usePathname();
  const { role, user } = useAdminSession();
  const { t } = useAdminLang();
  const { setOpenMobile } = useSidebar();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="gap-0 px-2 pt-3 pb-2">
        <Link
          href="/admin"
          onClick={() => setOpenMobile(false)}
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors",
            "hover:bg-sidebar-accent/60",
            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
          )}
        >
          <span className="relative block size-9 shrink-0 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
            <Image src="/logo-nnt.png" alt={siteConfig.name} fill className="object-contain p-1" sizes="36px" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            {/* The brand name is a name, not a phrase — the translator leaves it alone. */}
            <span
              className="notranslate truncate text-[13.5px] font-bold tracking-tight text-sidebar-foreground"
              translate="no"
            >
              {siteConfig.name}
            </span>
            <span className="truncate text-[10.5px] font-medium tracking-wide text-sidebar-foreground/50 uppercase">
              {t("एडमिन पोर्टल", "Admin portal")}
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {adminNavGroups.map((group) => {
          const items = group.items.filter(
            (item) => !item.permissions || canAny(role, item.permissions),
          );
          if (items.length === 0) return null;

          return (
            <SidebarGroup key={group.label} className="px-2 py-1">
              <SidebarGroupLabel className="h-7 px-2 text-[10px] font-semibold tracking-[0.12em] text-sidebar-foreground/45 uppercase">
                {t(group.label, group.labelEn)}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const count = item.badgeKey ? badges[item.badgeKey] : 0;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.href)}
                          tooltip={t(item.label, item.labelEn)}
                          className={cn(
                            "relative h-9 gap-2.5 rounded-lg font-medium",
                            // The rail on the left is what tells you where you
                            // are at a glance, even before the tint registers.
                            "before:absolute before:top-1/2 before:left-0 before:h-0 before:w-[3px]",
                            "before:-translate-y-1/2 before:rounded-r-full before:bg-accent",
                            "before:transition-all before:content-['']",
                            "data-[active=true]:before:h-5",
                            "data-[active=true]:bg-accent/10 data-[active=true]:text-accent",
                            "data-[active=true]:hover:bg-accent/15",
                            "group-data-[collapsible=icon]:before:hidden",
                          )}
                        >
                          <Link href={item.href} onClick={() => setOpenMobile(false)}>
                            <AdminIcon
                              name={item.icon}
                              className={cn(
                                "size-[18px] shrink-0 transition-colors",
                                isActive(item.href) ? "text-accent" : "text-sidebar-foreground/60",
                              )}
                            />
                            <span className="text-[13.5px]">{t(item.label, item.labelEn)}</span>
                          </Link>
                        </SidebarMenuButton>
                        {count > 0 ? (
                          <SidebarMenuBadge className="min-w-5 justify-center rounded-full bg-accent px-1.5 text-[10.5px] font-bold text-white tabular-nums">
                            {count}
                          </SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="gap-2 px-2 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={t("वेबसाइट देखें", "View website")}
              className="h-9 gap-2.5 rounded-lg font-medium"
            >
              <Link href="/" target="_blank">
                <IconExternalLink className="size-[18px] shrink-0 text-sidebar-foreground/60" stroke={1.7} />
                <span className="text-[13.5px]">{t("वेबसाइट देखें", "View website")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* The signed-in person as a card rather than a loose row, and a way
            out of the portal from the same place. */}
        <Link
          href="/admin/profile"
          onClick={() => setOpenMobile(false)}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-2",
            "transition-colors hover:bg-sidebar-accent",
            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0",
            "group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0",
          )}
        >
          <span className="relative shrink-0">
            <Avatar className="size-9">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-xs font-semibold">{user.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <IconCircleFilled className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full text-emerald-500 ring-2 ring-sidebar" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-[13px] font-semibold text-sidebar-foreground">{user.name}</span>
            <span className="mt-0.5 flex">
              <RoleBadge role={role} size="xs" />
            </span>
          </span>
          <IconChevronRight className="size-4 shrink-0 text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden" />
        </Link>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
