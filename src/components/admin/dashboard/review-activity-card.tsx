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
import { useAdminSession } from "@/components/admin/admin-session";
import type * as api from "@/lib/api/admin";

/** One person's avatar, name and role — a link into their record only for
 *  someone allowed to open it. */
function Person({
  row,
  linkable,
  size,
}: {
  row: api.ReviewActivity;
  linkable: boolean;
  size: "sm" | "md";
}) {
  const body = (
    <>
      <Avatar className={size === "sm" ? "size-7 shrink-0" : "size-8 shrink-0"}>
        {row.avatarUrl ? <AvatarImage src={row.avatarUrl} alt="" /> : null}
        <AvatarFallback className={size === "sm" ? "text-[10px]" : "text-[11px]"}>
          {row.name.slice(0, 1)}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0">
        <span
          className={`block truncate font-medium text-text ${size === "sm" ? "" : "text-[13.5px]"}`}
        >
          {row.name}
        </span>
        <RoleBadge role={row.role} size="xs" />
      </span>
    </>
  );

  if (!linkable) {
    return <span className="flex items-center gap-2">{body}</span>;
  }
  return (
    <Link href={`/admin/users/${row.userId}`} className="flex items-center gap-2 hover:text-accent">
      {body}
    </Link>
  );
}

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
  // Only an administrator can open someone's record, so for anyone else the
  // name is text rather than a link into a page they will be refused.
  const { can } = useAdminSession();
  const linkable = can("users.manage");
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
    <Card className="min-w-0 gap-4">
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
          <div className="-mx-1 overflow-x-auto px-1">
            <table className="hidden w-full min-w-[520px] text-[13px] sm:table">
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
                      <Person row={row} linkable={linkable} size="sm" />
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

        {/* A six-column table is unreadable on a phone, so each person
            becomes a card with their numbers laid out as a small grid. */}
        {rows.length > 0 ? (
          <ul className="flex flex-col gap-2 sm:hidden">
            {rows.map((row) => (
              <li key={row.userId} className="rounded-lg border border-border p-3">
                <Person row={row} linkable={linkable} size="md" />
                <dl className="mt-2.5 grid grid-cols-3 gap-y-2 text-center">
                  {columns.map((column) => (
                    <div key={column.key}>
                      <dt className="flex items-center justify-center gap-1 text-[10.5px] text-text-muted">
                        <column.Icon className={`size-3 ${column.tone}`} />
                        {column.label}
                      </dt>
                      <dd
                        className={`text-[15px] tabular-nums ${
                          row[column.key] > 0 ? "font-semibold text-text" : "text-text-muted"
                        }`}
                      >
                        {row[column.key]}
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
