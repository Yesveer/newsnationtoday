"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconCheck,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconFilter,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSend,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { useAdminSession } from "@/components/admin/admin-session";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { categoriesConfig } from "@/config/categories.config";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import { formatCompact, formatRelative } from "@/lib/admin/format";
import type { NewsItem, NewsStatus } from "@/types/admin";
import { cn } from "@/lib/cn";

const statusTabs: { value: NewsStatus | "all"; label: string; labelEn: string }[] = [
  { value: "all", label: "सभी", labelEn: "All" },
  { value: "published", label: "पब्लिश्ड", labelEn: "Published" },
  { value: "in_review", label: "रिव्यू में", labelEn: "In review" },
  { value: "changes_requested", label: "बदलाव", labelEn: "Changes" },
  { value: "scheduled", label: "शेड्यूल्ड", labelEn: "Scheduled" },
  { value: "draft", label: "ड्राफ़्ट", labelEn: "Drafts" },
  { value: "rejected", label: "रिजेक्टेड", labelEn: "Rejected" },
];

const PAGE_SIZE = 10;

export function NewsTableView({
  title,
  description,
  onlyVideos = false,
}: {
  title?: string;
  description?: string;
  onlyVideos?: boolean;
}) {
  const { user, role, can } = useAdminSession();
  const { t } = useAdminLang();
  const [status, setStatus] = useState<NewsStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [scope, setScope] = useState<"all" | "mine">(role === "reporter" ? "mine" : "all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<NewsItem | null>(null);

  const isReporter = role === "reporter";
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // The API already scopes a reporter to their own stories; the filters here
  // only narrow what it returns. Fetching is kept free of setState so the
  // mount effect can await before touching React state.
  const fetchPage = useCallback(async () => {
    try {
      const page = await api.listNews({ limit: 100, type: onlyVideos ? "video" : undefined });
      return { items: page.items, error: null as string | null };
    } catch (error) {
      return {
        items: [] as NewsItem[],
        error:
          error instanceof ApiError
            ? error.message
            : t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."),
      };
    }
  }, [onlyVideos, t]);

  const apply = useCallback((result: { items: NewsItem[]; error: string | null }) => {
    setItems(result.items);
    setLoadError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await fetchPage();
      if (active) apply(result);
    })();
    return () => {
      active = false;
    };
  }, [fetchPage, apply]);

  const load = useCallback(async () => {
    setLoading(true);
    apply(await fetchPage());
  }, [fetchPage, apply]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (onlyVideos && item.type !== "video") return false;
      // A reporter may only ever see their own desk of stories.
      if (isReporter && item.authorId !== user.id) return false;
      if (!isReporter && scope === "mine" && item.authorId !== user.id) return false;
      if (status !== "all" && item.status !== status) return false;
      if (category !== "all" && item.categorySlug !== category) return false;
      if (query.trim()) {
        const haystack = `${item.title} ${item.authorName} ${item.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(query.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [items, onlyVideos, isReporter, user.id, scope, status, category, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const allOnPageSelected = rows.length > 0 && rows.every((row) => selected.includes(row.id));

  const toggleAll = () => {
    setSelected((current) =>
      allOnPageSelected
        ? current.filter((id) => !rows.some((row) => row.id === id))
        : [...new Set([...current, ...rows.map((row) => row.id)])],
    );
  };

  const counts = useMemo(() => {
    const base = items.filter((item) => (isReporter ? item.authorId === user.id : true));
    return statusTabs.reduce<Record<string, number>>((acc, tab) => {
      acc[tab.value] =
        tab.value === "all" ? base.length : base.filter((item) => item.status === tab.value).length;
      return acc;
    }, {});
  }, [items, isReporter, user.id]);

  const report = (error: unknown, fallback: string) => {
    toast.error(error instanceof ApiError ? error.message : fallback);
  };

  const applyStatus = async (item: NewsItem, next: api.NewsStatus, message: string) => {
    try {
      await api.changeNewsStatus(item.id, next);
      toast.success(message);
      await load();
    } catch (error) {
      report(error, t("स्थिति नहीं बदली", "Could not change the status"));
    }
  };

  const remove = async (item: NewsItem) => {
    try {
      const result = await api.deleteNews(item.id);
      toast.success(
        result.message ??
          (can("news.delete") ? t("खबर डिलीट की गई", "Story deleted") : t("रिक्वेस्ट भेज दी गई", "Request sent")),
      );
      setPendingDelete(null);
      await load();
    } catch (error) {
      report(error, t("यह कार्रवाई पूरी नहीं हुई", "That action did not go through"));
      setPendingDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={title ?? (onlyVideos ? t("वीडियो", "Videos") : t("सभी खबरें", "All news"))}
        description={
          description ??
          (onlyVideos
            ? t(
                "वीडियो स्टोरीज़ — वेबसाइट के वीडियो सेक्शन और रेल विजेट में यही दिखती हैं।",
                "Video stories — these fill the site's video section and rail widget.",
              )
            : t("पूरी वेबसाइट का कंटेंट यहीं से मैनेज होता है।", "The website's entire content is managed from here."))
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <IconRefresh className="size-4" /> {t("रिफ्रेश", "Refresh")}
            </Button>
            {selected.length > 0 && can("news.publish") ? (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const chosen = items.filter((item) => selected.includes(item.id));
                  await Promise.all(chosen.map((item) => api.changeNewsStatus(item.id, "published").catch(() => null)));
                  toast.success(t(`${chosen.length} खबरें पब्लिश हुईं`, `Published ${chosen.length}`));
                  setSelected([]);
                  await load();
                }}
              >
                <IconCheck className="size-4" /> {t(`${selected.length} पब्लिश करें`, `Publish ${selected.length}`)}
              </Button>
            ) : null}
            {can("news.create") ? (
              <Button asChild size="sm">
                <Link href="/admin/news/new">
                  <IconPlus className="size-4" /> {t("नई खबर", "New story")}
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      {loadError ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" /> {loadError}
        </p>
      ) : null}

      <Tabs
        value={status}
        onValueChange={(value) => {
          setStatus(value as NewsStatus | "all");
          setPage(1);
        }}
      >
        <TabsList className="flex w-full flex-wrap justify-start gap-1 rounded-lg">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="rounded-md text-[13px]">
              {t(tab.label, tab.labelEn)}
              <span className="ml-1 text-[11px] text-text-muted tabular-nums">{counts[tab.value] ?? 0}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

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
              placeholder={t("हेडलाइन, रिपोर्टर या टैग से खोजें…", "Search by headline, reporter or tag…")}
              className="h-9 pl-8"
            />
          </div>
          <Select
            value={category}
            onValueChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-44">
              <IconFilter className="size-4 text-text-muted" />
              <SelectValue placeholder={t("कैटेगरी", "Category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("सभी कैटेगरी", "All categories")}</SelectItem>
              {categoriesConfig.map((item) => (
                <SelectItem key={item.slug} value={item.slug}>
                  {t(item.name, item.nameEn)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isReporter ? (
            <Select value={scope} onValueChange={(value) => setScope(value as "all" | "mine")}>
              <SelectTrigger className="h-9 w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("सभी रिपोर्टर", "All reporters")}</SelectItem>
                <SelectItem value="mine">{t("सिर्फ़ मेरी", "Only mine")}</SelectItem>
              </SelectContent>
            </Select>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox checked={allOnPageSelected} onCheckedChange={toggleAll} aria-label={t("सभी चुनें", "Select all")} />
                </TableHead>
                <TableHead className="min-w-[280px]">{t("खबर", "Story")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("कैटेगरी", "Category")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("रिपोर्टर", "Reporter")}</TableHead>
                <TableHead>{t("स्थिति", "Status")}</TableHead>
                <TableHead className="hidden sm:table-cell text-right">{t("व्यूज़", "Views")}</TableHead>
                <TableHead className="hidden xl:table-cell">{t("अपडेट", "Updated")}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="hover:bg-transparent">
                      <TableCell colSpan={8}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : null}
              {!loading &&
                rows.map((item) => {
                const categoryConfig = categoriesConfig.find((c) => c.slug === item.categorySlug);
                const canEdit = can("news.edit.any") || item.authorId === user.id;
                return (
                  <TableRow key={item.id} className={cn(selected.includes(item.id) && "bg-accent/5")}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(item.id)}
                        onCheckedChange={() =>
                          setSelected((current) =>
                            current.includes(item.id)
                              ? current.filter((id) => id !== item.id)
                              : [...current, item.id],
                          )
                        }
                        aria-label={t("चुनें", "Select")}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2.5">
                        <span className="relative hidden h-11 w-16 shrink-0 overflow-hidden rounded-md bg-surface-muted sm:block">
                          <Image src={item.coverImageUrl} alt="" fill className="object-cover" sizes="64px" />
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/news/${item.id}`}
                            className="line-clamp-2 text-[13.5px] leading-snug font-medium text-text hover:text-accent"
                          >
                            {item.title}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-text-muted">
                            <span className="rounded bg-surface-muted px-1.5 py-0.5">
                              {item.type === "video"
                                ? t("वीडियो", "Video")
                                : item.type === "photo"
                                  ? t("फोटो", "Photo")
                                  : t("आर्टिकल", "Article")}
                            </span>
                            {item.isBreaking ? (
                              <span className="rounded bg-accent/12 px-1.5 py-0.5 font-semibold text-accent">
                                {t("ब्रेकिंग", "Breaking")}
                              </span>
                            ) : null}
                            {item.deleteRequested ? (
                              <span className="rounded border border-border px-1.5 py-0.5 font-semibold text-text-muted">
                                {t("डिलीट रिक्वेस्ट", "Delete requested")}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-muted">
                        {categoryConfig ? t(categoryConfig.name, categoryConfig.nameEn) : item.categorySlug}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-[12.5px] text-text-muted">
                      {item.authorName}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right text-[12.5px] tabular-nums text-text-muted">
                      {item.status === "published" ? formatCompact(item.views) : "—"}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-[12px] whitespace-nowrap text-text-muted">
                      {formatRelative(item.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={t("विकल्प", "Options")}>
                            <IconDotsVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem asChild disabled={!canEdit}>
                            <Link href={`/admin/news/${item.id}`}>
                              <IconEdit className="size-4" /> {t("एडिट करें", "Edit")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/${item.categorySlug}/${item.slug}`} target="_blank">
                              <IconArrowUpRight className="size-4" /> {t("साइट पर देखें", "View on site")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {can("news.publish") ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => void applyStatus(item, "published", t("खबर पब्लिश की गई", "Story published"))}
                              >
                                <IconCheck className="size-4" /> {t("पब्लिश करें", "Publish")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => void applyStatus(item, "rejected", t("खबर रिजेक्ट की गई", "Story rejected"))}
                              >
                                <IconX className="size-4" /> {t("रिजेक्ट करें", "Reject")}
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => void applyStatus(item, "in_review", t("खबर रिव्यू के लिए भेजी गई", "Sent for review"))}
                            >
                              <IconSend className="size-4" /> {t("रिव्यू में भेजें", "Send for review")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/news/${item.id}#preview`}>
                              <IconEye className="size-4" /> {t("प्रीव्यू", "Preview")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={!canEdit}
                            onClick={() => setPendingDelete(item)}
                          >
                            <IconTrash className="size-4" />
                            {can("news.delete") ? t("डिलीट करें", "Delete") : t("डिलीट की रिक्वेस्ट", "Request delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!loading && rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-text-muted">
                    {t("इस फ़िल्टर पर कोई खबर नहीं मिली।", "No stories match this filter.")}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t p-3 sm:flex-row">
          <p className="text-[12px] text-text-muted">
            {t(
              `${filtered.length} में से ${rows.length} दिख रही हैं`,
              `Showing ${rows.length} of ${filtered.length}`,
            )}
            {selected.length > 0 ? t(` · ${selected.length} चुनी गईं`, ` · ${selected.length} selected`) : ""}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => value - 1)}
            >
              {t("पिछला", "Previous")}
            </Button>
            <span className="px-1 text-[12px] tabular-nums text-text-muted">
              {currentPage} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === pageCount}
              onClick={() => setPage((value) => value + 1)}
            >
              {t("अगला", "Next")}
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {can("news.delete")
                ? t("खबर डिलीट करें?", "Delete this story?")
                : t("डिलीट की रिक्वेस्ट भेजें?", "Send a delete request?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {can("news.delete")
                ? t(
                    "यह खबर वेबसाइट से तुरंत हट जाएगी। यह कार्रवाई ऑडिट लॉग में दर्ज होगी।",
                    "The story will disappear from the website at once. The action is recorded in the audit log.",
                  )
                : t(
                    "रिपोर्टर सीधे डिलीट नहीं कर सकते। आपकी रिक्वेस्ट एडमिन के पास अप्रूवल के लिए जाएगी।",
                    "Reporters can't delete directly. Your request goes to an admin for approval.",
                  )}
              <span className="mt-2 block font-medium text-text">“{pendingDelete?.title}”</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("रहने दें", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && void remove(pendingDelete)}
            >
              {can("news.delete") ? t("हाँ, डिलीट करें", "Yes, delete") : t("रिक्वेस्ट भेजें", "Send request")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
