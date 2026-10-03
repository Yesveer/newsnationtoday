"use client";

import Link from "next/link";
import {
  IconArrowBackUp,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconMessage2,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleBadge } from "@/components/admin/role-badge";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import type * as api from "@/lib/api/admin";

/** Who has been doing the reviewing.
 *
 *  Counted from the stories themselves — their status history and comment
 *  lists — so it cannot drift away from what actually happened. */
export function ReviewActivityCard({
  activity,
  compact,
}: {
  activity: api.ReviewActivity[];
  /** On the dashboard, show only the people who have done something. */
  compact?: boolean;
}) {
  const { t } = useAdminLang();
  const rows = compact
    ? activity.filter((row) => row.total > 0 || row.comments > 0 || row.pending > 0)
    : activity;

  const columns = [
    { key: "approved" as const, label: t("अप्रूव", "Approved"), Icon: IconCircleCheck, tone: "text-emerald-600 dark:text-emerald-400" },
    { key: "changesRequested" as const, label: t("बदलाव मांगे", "Changes"), Icon: IconArrowBackUp, tone: "text-amber-600 dark:text-amber-400" },
    { key: "rejected" as const, label: t("रिजेक्ट", "Rejected"), Icon: IconCircleX, tone: "text-rose-600 dark:text-rose-400" },
    { key: "comments" as const, label: t("कमेंट", "Comments"), Icon: IconMessage2, tone: "text-text-muted" },
    { key: "pending" as const, label: t("बाकी", "Pending"), Icon: IconClock, tone: "text-accent" },
  ];

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="font-display text-base font-bold">
          {t("रिव्यू का हिसाब", "Review activity")}
        </CardTitle>
        <CardDescription>
          {t(
            "किसने कितनी खबरें अप्रूव कीं, लौटाईं, रिजेक्ट कीं और कितने कमेंट किए।",
            "Who approved, sent back, rejected and commented — and what is still on their plate.",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            {t("अभी किसी ने रिव्यू नहीं किया।", "No review work recorded yet.")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-[11px] text-text-muted">
                  <th className="pb-2 font-medium">{t("नाम", "Name")}</th>
                  {columns.map((column) => (
                    <th key={column.key} className="pb-2 text-center font-medium">
                      <span className="flex items-center justify-center gap-1">
                        <column.Icon className={`size-3.5 ${column.tone}`} />
                        <span className="hidden sm:inline">{column.label}</span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.userId} className="border-b border-border/60 last:border-0">
                    <td className="py-2">
                      <Link
                        href={`/admin/users/${row.userId}`}
                        className="flex items-center gap-2 hover:text-accent"
                      >
                        <Avatar className="size-7 shrink-0">
                          {row.avatarUrl ? <AvatarImage src={row.avatarUrl} alt="" /> : null}
                          <AvatarFallback className="text-[10px]">
                            {row.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-text">{row.name}</span>
                          <RoleBadge role={row.role} size="xs" />
                        </span>
                      </Link>
                    </td>
                    {columns.map((column) => {
                      const value = row[column.key];
                      return (
                        <td
                          key={column.key}
                          className={`py-2 text-center tabular-nums ${
                            value > 0 ? "font-semibold text-text" : "text-text-muted"
                          }`}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
