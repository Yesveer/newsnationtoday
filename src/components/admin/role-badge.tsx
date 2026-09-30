"use client";

import { roleLabels } from "@/lib/admin/permissions";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { toneDotStyle, toneStyle, type ToneLevel } from "@/lib/admin/tone";
import type { UserRole } from "@/types/admin";
import { cn } from "@/lib/cn";

/** One colour for every role — seniority reads as intensity, not hue. */
const roleTone: Record<UserRole, ToneLevel> = {
  administrator: "strong",
  admin: "medium",
  reporter: "soft",
};

export function RoleBadge({
  role,
  size = "sm",
  className,
}: {
  role: UserRole;
  size?: "xs" | "sm";
  className?: string;
}) {
  const { t } = useAdminLang();
  const level = roleTone[role];

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full border font-semibold whitespace-nowrap",
        size === "xs" ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-[11px]",
        className,
      )}
      style={toneStyle(level)}
    >
      <span className="size-1.5 rounded-full" style={toneDotStyle(level)} />
      {t(roleLabels[role].name, roleLabels[role].nameEn)}
    </span>
  );
}
