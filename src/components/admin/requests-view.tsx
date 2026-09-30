"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { IconAlertTriangle, IconCheck, IconRefresh, IconTrash, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { formatRelative } from "@/lib/admin/format";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import type { NewsItem } from "@/types/admin";

/** A reporter can never delete a live story outright — they file a request and
 *  an admin decides here. Approving removes the story from the site. */
export function RequestsView() {
  const { t } = useAdminLang();
  const [requests, setRequests] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      return { requests: await api.listDeleteRequests(), error: null as string | null };
    } catch (apiError) {
      return {
        requests: [] as NewsItem[],
        error:
          apiError instanceof ApiError
            ? apiError.message
            : t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."),
      };
    }
  }, [t]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await fetchRequests();
      if (!active) return;
      setRequests(result.requests);
      setError(result.error);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchRequests]);

  const reload = async () => {
    setLoading(true);
    const result = await fetchRequests();
    setRequests(result.requests);
    setError(result.error);
    setLoading(false);
  };

  const decide = async (item: NewsItem, approve: boolean) => {
    try {
      await api.resolveDeleteRequest(item.id, approve);
      toast.success(
        approve
          ? t("रिक्वेस्ट अप्रूव — खबर हटा दी गई", "Request approved — story removed")
          : t("रिक्वेस्ट रिजेक्ट कर दी गई", "Request rejected"),
        { description: t("ऑडिट लॉग में दर्ज।", "Recorded in the audit log.") },
      );
      await reload();
    } catch (apiError) {
      toast.error(
        apiError instanceof ApiError ? apiError.message : t("कार्रवाई पूरी नहीं हुई", "That did not go through"),
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("अप्रूवल रिक्वेस्ट", "Approvals")}
        description={t(
          "रिपोर्टर सीधे खबर डिलीट नहीं कर सकते — हर रिक्वेस्ट यहाँ एडमिन के पास आती है।",
          "Reporters can't delete a story themselves — every request lands here for an admin.",
        )}
        actions={
          <Button variant="outline" size="sm" disabled={loading} onClick={() => void reload()}>
            <IconRefresh className="size-4" /> {t("रिफ्रेश", "Refresh")}
          </Button>
        }
      />

      {error ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" /> {error}
        </p>
      ) : null}

      <Card className="gap-0 py-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[240px]">{t("खबर", "Story")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("रिपोर्टर", "Reporter")}</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[200px]">{t("वजह", "Reason")}</TableHead>
                <TableHead>{t("स्थिति", "Status")}</TableHead>
                <TableHead className="text-right">{t("कार्रवाई", "Action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index} className="hover:bg-transparent">
                      <TableCell colSpan={5}>
                        <Skeleton className="h-9 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : requests.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Link
                          href={`/admin/news/${item.id}`}
                          className="line-clamp-2 text-[13.5px] font-medium text-text hover:text-accent"
                        >
                          {item.title}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-text-muted">
                          {formatRelative(item.updatedAt, new Date())}
                        </p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-[13px] text-text">{item.authorName}</TableCell>
                      <TableCell className="hidden lg:table-cell text-[12.5px] text-text-muted">
                        {item.deleteReason || t("कोई वजह नहीं दी गई", "No reason given")}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" onClick={() => void decide(item, true)}>
                            <IconCheck className="size-4" /> {t("अप्रूव", "Approve")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => void decide(item, false)}
                          >
                            <IconX className="size-4" /> {t("रिजेक्ट", "Reject")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              {!loading && requests.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-text-muted">
                    <IconTrash className="mx-auto mb-2 size-6 opacity-40" />
                    {t("कोई पेंडिंग रिक्वेस्ट नहीं।", "No pending requests.")}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
