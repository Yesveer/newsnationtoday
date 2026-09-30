"use client";

import { newsStatusLabels } from "@/data/admin/news-items";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { toneDotStyle, toneStyle, type ToneLevel } from "@/lib/admin/tone";
import type { NewsStatus } from "@/types/admin";
import { cn } from "@/lib/cn";

/** Single-colour badges: the label says what the status is, the intensity says
 *  how much it wants your attention. */
const statusTone: Record<NewsStatus, ToneLevel> = {
  published: "strong",
  in_review: "medium",
  changes_requested: "medium",
  scheduled: "soft",
  draft: "soft",
  rejected: "soft",
  archived: "soft",
};

export function StatusBadge({ status, className }: { status: NewsStatus; className?: string }) {
  const { t } = useAdminLang();
  const { label, labelEn } = newsStatusLabels[status];
  const level = statusTone[status];

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        className,
      )}
      style={toneStyle(level)}
    >
      <span className="size-1.5 rounded-full" style={toneDotStyle(level)} />
      {t(label, labelEn)}
    </span>
  );
}
