"use client";

import { SafeImage as Image } from "@/components/ui/safe-image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconArrowLeft, IconCircleFilled } from "@tabler/icons-react";
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
  SidebarSeparator,
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
      <SidebarHeader className="gap-0 border-b border-sidebar-border">
        <Link
          href="/admin"
          onClick={() => setOpenMobile(false)}
          className="flex items-center gap-2.5 px-2 py-2.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
        >
          <span className="relative block h-8 w-8 shrink-0 overflow-hidden rounded-md bg-sidebar-accent">
            <Image src="/logo-nnt.png" alt={siteConfig.name} fill className="object-contain p-0.5" sizes="32px" />
          </span>
          <span className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            {/* The brand name is a name, not a phrase — the translator leaves it alone. */}
            <span
              className="notranslate truncate text-sm font-bold tracking-tight text-sidebar-foreground"
              translate="no"
            >
              {siteConfig.name}
            </span>
            <span className="truncate text-[11px] text-sidebar-foreground/60">{t("एडमिन पोर्टल", "Admin portal")}</span>
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
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-[11px] font-semibold tracking-wide text-sidebar-foreground/50 uppercase">
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
                          className="gap-2.5"
                        >
                          <Link href={item.href} onClick={() => setOpenMobile(false)}>
                            <AdminIcon name={item.icon} className="size-[18px]" />
                            <span className="text-[13.5px]">{t(item.label, item.labelEn)}</span>
                          </Link>
                        </SidebarMenuButton>
                        {count > 0 ? (
                          <SidebarMenuBadge className="bg-accent/15 text-[11px] font-bold text-accent">
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

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t("वेबसाइट देखें", "View website")} className="gap-2.5">
              <Link href="/" target="_blank">
                <IconArrowLeft className="size-[18px]" stroke={1.7} />
                <span className="text-[13.5px]">{t("वेबसाइट देखें", "View website")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />
        <div
          className={cn(
            "flex items-center gap-2.5 px-2 py-1.5",
            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
          )}
        >
          <Avatar className="size-8 shrink-0">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-xs">{user.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="flex items-center gap-1 truncate text-[13px] font-semibold text-sidebar-foreground">
              {user.name}
              <IconCircleFilled className="size-2 text-emerald-500" />
            </span>
            <RoleBadge role={role} size="xs" />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
