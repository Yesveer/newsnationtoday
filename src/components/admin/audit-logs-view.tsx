"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IconAlertTriangle,
  IconDownload,
  IconFlame,
  IconHistory,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { RoleBadge } from "@/components/admin/role-badge";
import { StatCard } from "@/components/admin/stat-card";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { toneStyle, type ToneLevel } from "@/lib/admin/tone";
import { formatDateTime, formatRelative } from "@/lib/admin/format";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import type { AuditLog, AuditSeverity } from "@/types/admin";

const severityStyles: Record<AuditSeverity, { label: string; labelEn: string; level: ToneLevel }> = {
  info: { label: "सामान्य", labelEn: "Info", level: "soft" },
  warning: { label: "चेतावनी", labelEn: "Warning", level: "medium" },
  critical: { label: "अहम", labelEn: "Critical", level: "strong" },
};

/** Areas are the prefix of an action string: auth.login → "auth". */
const areas = ["auth", "user", "news", "media", "appearance", "settings", "category"];

const PAGE_SIZE = 50;

export function AuditLogsView() {
  const { t, language } = useAdminLang();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totals, setTotals] = useState({ all: 0, warning: 0, critical: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<AuditSeverity | "all">("all");
  const [area, setArea] = useState("all");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // One page of rows, plus two count-only calls for the header tiles.
      const [current, warning, critical] = await Promise.all([
        api.listAuditLogs({
          search: query,
          action: area === "all" ? "" : area,
          severity: severity === "all" ? "" : severity,
          page,
          limit: PAGE_SIZE,
        }),
        api.listAuditLogs({ severity: "warning", limit: 1 }),
        api.listAuditLogs({ severity: "critical", limit: 1 }),
      ]);
      setLogs(current.items);
      setTotals({ all: current.total, warning: warning.total, critical: critical.total });
      setLoadError(null);
    } catch (error) {
      setLoadError(
        error instanceof ApiError ? error.message : t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."),
      );
    } finally {
      setLoading(false);
    }
  }, [query, area, severity, page, t]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, query]);

  const pageCount = Math.max(1, Math.ceil(totals.all / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("ऑडिट लॉग", "Audit logs")}
        description={t(
          "पोर्टल पर हुई हर कार्रवाई का रिकॉर्ड — कौन, कब, कहाँ से।",
          "A record of every action in the portal — who, when and from where.",
        )}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <IconRefresh className="size-4" /> {t("रिफ्रेश", "Refresh")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                toast.info(t("CSV एक्सपोर्ट अभी बाकी है", "CSV export is not built yet"), {
                  description: t("अगले फेज़ में जोड़ेंगे।", "Coming in the next phase."),
                })
              }
            >
              <IconDownload className="size-4" /> {t("एक्सपोर्ट", "Export")}
            </Button>
          </>
        }
      />

      {loadError ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" /> {loadError}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label={t("कुल इवेंट", "Total events")}
          value={totals.all}
          icon={<IconHistory className="size-5" stroke={1.7} />}
          hint={t("इस फ़िल्टर पर", "For this filter")}
        />
        <StatCard
          label={t("चेतावनी", "Warnings")}
          value={totals.warning}
          icon={<IconAlertTriangle className="size-5" stroke={1.7} />}
        />
        <StatCard
          label={t("अहम कार्रवाई", "Critical actions")}
          value={totals.critical}
          icon={<IconFlame className="size-5" stroke={1.7} />}
          hint={t("रोल बदलाव, डिलीट, पासवर्ड", "Role changes, deletes, passwords")}
        />
      </div>

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder={t("कार्रवाई, यूज़र या IP खोजें…", "Search action, user or IP…")}
              className="h-9 pl-8"
            />
          </div>
          <Select
            value={area}
            onValueChange={(value) => {
              setArea(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-40">
              <SelectValue placeholder={t("क्षेत्र", "Area")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("सभी क्षेत्र", "All areas")}</SelectItem>
              {areas.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={severity}
            onValueChange={(value) => {
              setSeverity(value as AuditSeverity | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("सभी स्तर", "All levels")}</SelectItem>
              <SelectItem value="info">{t("सामान्य", "Info")}</SelectItem>
              <SelectItem value="warning">{t("चेतावनी", "Warning")}</SelectItem>
              <SelectItem value="critical">{t("अहम", "Critical")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[150px]">{t("समय", "Time")}</TableHead>
                <TableHead className="min-w-[160px]">{t("यूज़र", "User")}</TableHead>
                <TableHead className="min-w-[260px]">{t("कार्रवाई", "Action")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("टारगेट", "Target")}</TableHead>
                <TableHead className="hidden md:table-cell">IP</TableHead>
                <TableHead>{t("स्तर", "Level")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={index} className="hover:bg-transparent">
                      <TableCell colSpan={6}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : logs.map((log) => {
                    const tone = severityStyles[log.severity];
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-[12px] whitespace-nowrap text-text-muted">
                          <p className="text-text">{formatRelative(log.at, language)}</p>
                          <p>{formatDateTime(log.at, language)}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-[13px] font-medium text-text">{log.actorName}</p>
                          {log.actorRole ? <RoleBadge role={log.actorRole} size="xs" className="mt-0.5" /> : null}
                        </TableCell>
                        <TableCell>
                          <p className="text-[13px] leading-snug text-text">{log.description}</p>
                          {/* Machine values — an action code or an IP means
                              nothing once it has been "translated". */}
                          <code
                            className="notranslate mt-0.5 inline-block rounded bg-surface-muted px-1.5 py-0.5 text-[10.5px] text-text-muted"
                            translate="no"
                          >
                            {log.action}
                          </code>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <code className="notranslate text-[11.5px] text-text-muted" translate="no">
                            {log.target}
                          </code>
                        </TableCell>
                        <TableCell className="notranslate hidden md:table-cell text-[12px] text-text-muted" translate="no">
                          {log.ip}
                        </TableCell>
                        <TableCell>
                          <span
                            className="rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
                            style={toneStyle(tone.level)}
                          >
                            {t(tone.label, tone.labelEn)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              {!loading && logs.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="py-12 text-center text-sm text-text-muted">
                    <IconShieldCheck className="mx-auto mb-2 size-6 opacity-40" />
                    {t("इस फ़िल्टर पर कोई इवेंट नहीं।", "No events match this filter.")}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t p-3 sm:flex-row">
          <p className="text-[12px] text-text-muted">
            {t(`${totals.all} में से ${logs.length} दिख रहे हैं`, `Showing ${logs.length} of ${totals.all}`)}
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              {t("पिछला", "Previous")}
            </Button>
            <span className="px-1 text-[12px] tabular-nums text-text-muted">
              {page} / {pageCount}
            </span>
            <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage(page + 1)}>
              {t("अगला", "Next")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
