"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconAlertTriangle,
  IconCheck,
  IconClockHour4,
  IconMessage2,
  IconPencil,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { categoriesConfig } from "@/config/categories.config";
import { formatRelative } from "@/lib/admin/format";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import type { NewsItem } from "@/types/admin";

/** Everything a reporter has sent in. Approving here publishes the story to the
 *  live site straight away. */
export function ReviewQueueView() {
  const { t } = useAdminLang();
  const [filter, setFilter] = useState<"all" | "in_review" | "changes_requested">("all");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    try {
      const [inReview, changes] = await Promise.all([
        api.listNews({ status: "in_review", limit: 100 }),
        api.listNews({ status: "changes_requested", limit: 100 }),
      ]);
      return { items: [...inReview.items, ...changes.items], error: null as string | null };
    } catch (apiError) {
      return {
        items: [] as NewsItem[],
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
      const result = await fetchQueue();
      if (!active) return;
      setItems(result.items);
      setError(result.error);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchQueue]);

  const reload = async () => {
    setLoading(true);
    const result = await fetchQueue();
    setItems(result.items);
    setError(result.error);
    setLoading(false);
  };

  const decide = async (item: NewsItem, status: api.NewsStatus, message: string) => {
    try {
      await api.changeNewsStatus(item.id, status);
      toast.success(message, { description: `“${item.title.slice(0, 40)}…”` });
      await reload();
    } catch (apiError) {
      toast.error(
        apiError instanceof ApiError ? apiError.message : t("कार्रवाई पूरी नहीं हुई", "That did not go through"),
      );
    }
  };

  const visible = items.filter((item) => filter === "all" || item.status === filter);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("रिव्यू क्यू", "Review queue")}
        description={t(
          "रिपोर्टर्स की भेजी खबरें — यहीं से अप्रूव, बदलाव या रिजेक्ट कीजिए।",
          "Stories sent in by reporters — approve, ask for changes or reject here.",
        )}
        actions={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-[12px] font-medium text-text-muted">
              <IconClockHour4 className="size-4" /> {t(`${visible.length} पेंडिंग`, `${visible.length} pending`)}
            </span>
            <Button variant="outline" size="sm" disabled={loading} onClick={() => void reload()}>
              <IconRefresh className="size-4" /> {t("रिफ्रेश", "Refresh")}
            </Button>
          </>
        }
      />

      {error ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" /> {error}
        </p>
      ) : null}

      <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
        <TabsList className="rounded-lg">
          <TabsTrigger value="all" className="rounded-md text-[13px]">{t("सभी", "All")}</TabsTrigger>
          <TabsTrigger value="in_review" className="rounded-md text-[13px]">{t("नई सबमिशन", "New submissions")}</TabsTrigger>
          <TabsTrigger value="changes_requested" className="rounded-md text-[13px]">{t("बदलाव मांगे गए", "Changes asked")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {visible.map((item) => {
            const category = categoriesConfig.find((c) => c.slug === item.categorySlug);
            return (
              <Card key={item.id} className="gap-0 overflow-hidden py-0">
                <CardContent className="flex gap-3 p-3">
                  <Link
                    href={`/admin/news/${item.id}`}
                    className="relative block h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-surface-muted"
                  >
                    <Image src={item.coverImageUrl} alt="" fill className="object-cover" sizes="128px" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={item.status} />
                      <span className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[10.5px] font-semibold text-text-muted">
                        {category ? t(category.name, category.nameEn) : item.categorySlug}
                      </span>
                    </div>
                    <Link
                      href={`/admin/news/${item.id}`}
                      className="line-clamp-2 text-[14px] leading-snug font-semibold text-text hover:text-accent"
                    >
                      {item.title}
                    </Link>
                    <p className="flex flex-wrap items-center gap-2 text-[11.5px] text-text-muted">
                      <span>{item.authorName}</span>
                      <span>· {formatRelative(item.updatedAt, new Date())}</span>
                      {item.comments.length > 0 ? (
                        <span className="inline-flex items-center gap-0.5">
                          <IconMessage2 className="size-3" /> {item.comments.length}
                        </span>
                      ) : null}
                    </p>
                  </div>
                </CardContent>
                <div className="flex flex-wrap gap-1.5 border-t bg-surface-muted/40 p-2.5">
                  <Button
                    size="sm"
                    onClick={() => void decide(item, "published", t("खबर पब्लिश कर दी गई", "Story published"))}
                  >
                    <IconCheck className="size-4" /> {t("अप्रूव", "Approve")}
                  </Button>
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/admin/news/${item.id}`}>
                      <IconPencil className="size-4" /> {t("बदलाव मांगें", "Ask for changes")}
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => void decide(item, "rejected", t("खबर रिजेक्ट कर दी गई", "Story rejected"))}
                  >
                    <IconX className="size-4" /> {t("रिजेक्ट", "Reject")}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && visible.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <IconCheck className="size-8 text-accent" stroke={1.5} />
            <p className="font-display text-base font-bold">{t("क्यू खाली है", "The queue is empty")}</p>
            <p className="text-sm text-text-muted">
              {t("सारी खबरें निपट चुकी हैं — बढ़िया काम!", "Every story is handled — nice work!")}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
