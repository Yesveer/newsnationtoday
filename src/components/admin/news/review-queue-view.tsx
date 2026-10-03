"use client";

import { useCallback, useEffect, useState } from "react";
import { SafeImage as Image } from "@/components/ui/safe-image";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconAlertTriangle,
  IconArrowBackUp,
  IconCheck,
  IconCircleCheck,
  IconCircleX,
  IconClockHour4,
  IconInbox,
  IconMessage2,
  IconPencil,
  IconRefresh,
  IconSearch,
  IconUserCheck,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { ReviewActivityCard } from "@/components/admin/dashboard/review-activity-card";
import { useAdminSession } from "@/components/admin/admin-session";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { categoriesConfig } from "@/config/categories.config";
import { formatDateTime, formatRelative } from "@/lib/admin/format";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import type { NewsItem } from "@/types/admin";

/** Who actually ruled on this story, and when.
 *
 *  `reviewedBy` only exists on stories decided after that field was added, so
 *  anything older falls back to the last decision in its history — the same
 *  fact, recorded a different way. */
const VERDICTS = {
  published: { hi: "अप्रूव किया", en: "Approved by", Icon: IconCircleCheck, tone: "text-emerald-600 dark:text-emerald-400" },
  scheduled: { hi: "शेड्यूल किया", en: "Scheduled by", Icon: IconClockHour4, tone: "text-sky-600 dark:text-sky-400" },
  rejected: { hi: "रिजेक्ट किया", en: "Rejected by", Icon: IconCircleX, tone: "text-rose-600 dark:text-rose-400" },
  changes_requested: { hi: "बदलाव मांगे", en: "Changes asked by", Icon: IconArrowBackUp, tone: "text-amber-600 dark:text-amber-400" },
} as const;

type Verdict = (typeof VERDICTS)[keyof typeof VERDICTS];

function decision(item: NewsItem): (Verdict & { name: string; at: string }) | null {
  const verdict = VERDICTS[item.status as keyof typeof VERDICTS];
  if (!verdict) return null;

  if (item.reviewedBy) {
    return { ...verdict, name: item.reviewedBy.name, at: item.reviewedAt ?? item.updatedAt };
  }
  // Stories decided before `reviewedBy` existed still carry the same fact in
  // their history — the last event matching the status they ended up in.
  const last = (item.history ?? []).filter((event) => event.status === item.status).at(-1);
  return last ? { ...verdict, name: last.byName, at: last.at } : null;
}

const TABS: { value: api.ReviewTab; hi: string; en: string }[] = [
  { value: "pending", hi: "बाकी", en: "Pending" },
  { value: "mine", hi: "मेरे पास", en: "Assigned to me" },
  { value: "changes", hi: "बदलाव मांगे", en: "Changes asked" },
  { value: "completed", hi: "पूरे हुए", en: "Completed" },
  { value: "rejected", hi: "रिजेक्ट", en: "Rejected" },
  { value: "all", hi: "सारा इतिहास", en: "Full history" },
];

/** The desk's screen.
 *
 *  Not just an inbox: the tabs span the whole life of a decision, so "what did
 *  we approve last week, and who approved it" is answerable here rather than
 *  only in the audit log. */
export function ReviewQueueView() {
  const { t, language } = useAdminLang();
  const { role } = useAdminSession();

  const [tab, setTab] = useState<api.ReviewTab>("pending");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [decidedBy, setDecidedBy] = useState("anyone");
  const [queue, setQueue] = useState<api.ReviewQueue | null>(null);
  const [reviewers, setReviewers] = useState<api.Reviewer[]>([]);
  const [activity, setActivity] = useState<api.ReviewActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Typing must not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchQueue = useCallback(async () => {
    try {
      const result = await api.listReviewQueue({
        tab,
        search: query || undefined,
        decidedBy: decidedBy === "anyone" ? undefined : decidedBy,
        limit: 60,
      });
      return { queue: result, error: null as string | null };
    } catch (apiError) {
      return {
        queue: null,
        error:
          apiError instanceof ApiError
            ? apiError.message
            : t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."),
      };
    }
  }, [tab, query, decidedBy, t]);

  useEffect(() => {
    let active = true;
    void (async () => {
      setLoading(true);
      const result = await fetchQueue();
      if (!active) return;
      setQueue(result.queue);
      setError(result.error);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchQueue]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [people, rows] = await Promise.all([
        api.listReviewers().catch(() => [] as api.Reviewer[]),
        api.listReviewActivity().catch(() => [] as api.ReviewActivity[]),
      ]);
      if (!active) return;
      setReviewers(people);
      setActivity(rows);
    })();
    return () => {
      active = false;
    };
  }, []);

  const reload = async () => {
    setLoading(true);
    const [result, rows] = await Promise.all([
      fetchQueue(),
      api.listReviewActivity().catch(() => activity),
    ]);
    setQueue(result.queue);
    setActivity(rows);
    setError(result.error);
    setLoading(false);
  };

  const decide = async (item: NewsItem, status: api.NewsStatus, message: string) => {
    setBusy(item.id);
    try {
      await api.changeNewsStatus(item.id, status);
      toast.success(message, { description: `“${item.title.slice(0, 40)}…”` });
      await reload();
    } catch (apiError) {
      toast.error(
        apiError instanceof ApiError
          ? apiError.message
          : t("कार्रवाई पूरी नहीं हुई", "That did not go through"),
      );
    } finally {
      setBusy(null);
    }
  };

  const counts = queue?.counts;
  const items = queue?.items ?? [];
  // Pending and "changes asked" are work to do; the rest is work already done.
  const actionable = tab === "pending" || tab === "mine" || tab === "changes";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("रिव्यू क्यू", "Review queue")}
        description={t(
          "रिपोर्टर्स की भेजी खबरें, और अब तक के सारे फ़ैसले — किसने क्या अप्रूव या रिजेक्ट किया।",
          "Stories sent in by reporters, and every decision since — what was approved or rejected, and by whom.",
        )}
        actions={
          <Button variant="outline" size="sm" disabled={loading} onClick={() => void reload()}>
            <IconRefresh className="size-4" /> {t("रिफ्रेश", "Refresh")}
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("रिव्यू बाकी", "Waiting for review")}
          value={counts?.pending ?? 0}
          icon={<IconClockHour4 className="size-5" stroke={1.7} />}
          hint={t(`${counts?.mine ?? 0} आपके नाम`, `${counts?.mine ?? 0} assigned to you`)}
        />
        <StatCard
          label={t("अप्रूव हुईं", "Approved")}
          value={counts?.completed ?? 0}
          icon={<IconCircleCheck className="size-5" stroke={1.7} />}
          hint={t("पब्लिश और शेड्यूल्ड", "Published and scheduled")}
        />
        <StatCard
          label={t("बदलाव मांगे", "Changes asked")}
          value={counts?.changes ?? 0}
          icon={<IconArrowBackUp className="size-5" stroke={1.7} />}
          hint={t("रिपोर्टर के पास वापस", "Back with the reporter")}
        />
        <StatCard
          label={t("रिजेक्ट हुईं", "Rejected")}
          value={counts?.rejected ?? 0}
          icon={<IconCircleX className="size-5" stroke={1.7} />}
          hint={t("चली नहीं", "Did not run")}
        />
      </div>

      {error ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" /> {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <Tabs value={tab} onValueChange={(value) => setTab(value as api.ReviewTab)}>
          <TabsList className="h-auto flex-wrap rounded-lg">
            {TABS.map((entry) => (
              <TabsTrigger key={entry.value} value={entry.value} className="rounded-md text-[13px]">
                {t(entry.hi, entry.en)}
                {counts ? (
                  <span className="ml-1.5 rounded-full bg-surface px-1.5 text-[10.5px] tabular-nums">
                    {counts[entry.value] ?? 0}
                  </span>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("हेडलाइन या रिपोर्टर…", "Headline or reporter…")}
              className="h-9 w-56 pl-8 text-[13px]"
            />
          </div>
          <Select value={decidedBy} onValueChange={setDecidedBy}>
            <SelectTrigger size="sm" className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anyone">
                {t("किसी ने भी फ़ैसला किया", "Decided by anyone")}
              </SelectItem>
              {reviewers.map((person) => (
                <SelectItem key={person.id} value={person.id}>
                  {person.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            {actionable ? (
              <IconCheck className="size-8 text-accent" stroke={1.5} />
            ) : (
              <IconInbox className="size-8 text-text-muted" stroke={1.5} />
            )}
            <p className="font-display text-base font-bold">
              {actionable
                ? t("कुछ बाकी नहीं है", "Nothing waiting")
                : t("यहाँ अभी कुछ नहीं", "Nothing here yet")}
            </p>
            <p className="max-w-md text-sm text-text-muted">
              {actionable
                ? t("सारी खबरें निपट चुकी हैं — बढ़िया काम!", "Every story is handled — nice work!")
                : t(
                    "जैसे-जैसे खबरें अप्रूव या रिजेक्ट होंगी, हर फ़ैसले का रिकॉर्ड यहाँ जुड़ता जाएगा।",
                    "As stories are approved or rejected, the record of each decision collects here.",
                  )}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const category = categoriesConfig.find((entry) => entry.slug === item.categorySlug);
            const ruling = decision(item);
            return (
              <li key={item.id}>
                <Card className="gap-0 overflow-hidden py-0">
                  <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                    <Link
                      href={`/admin/news/${item.id}`}
                      className="relative block h-20 w-full shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:h-16 sm:w-24"
                    >
                      <Image src={item.coverImageUrl} alt="" fill className="object-cover" sizes="96px" />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
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
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-text-muted">
                        <span>
                          {t("रिपोर्टर", "Reporter")}:{" "}
                          <span className="font-medium text-text">{item.authorName}</span>
                        </span>

                        {/* Work to do shows who it waits on; work done shows
                            who actually ruled on it. */}
                        {actionable && item.reviewers?.length ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-1.5 py-0.5 text-accent">
                            <IconUserCheck className="size-3" />
                            {item.reviewers.map((person) => person.name).join(", ")}
                          </span>
                        ) : null}

                        {!actionable && ruling ? (
                          <span className="inline-flex items-center gap-1">
                            <ruling.Icon className={`size-3 ${ruling.tone}`} />
                            {t(ruling.hi, ruling.en)}:{" "}
                            <span className="font-medium text-text">{ruling.name}</span>
                            <span>· {formatDateTime(ruling.at, language)}</span>
                          </span>
                        ) : null}

                        {actionable ? (
                          <span>
                            {t("भेजी गई", "Sent")} {formatRelative(item.updatedAt, language)}
                          </span>
                        ) : null}

                        {item.comments.length > 0 ? (
                          <span className="inline-flex items-center gap-0.5">
                            <IconMessage2 className="size-3" /> {item.comments.length}
                          </span>
                        ) : null}
                      </p>
                    </div>

                    {actionable ? (
                      <div className="flex shrink-0 flex-wrap gap-1.5">
                        <Button
                          size="sm"
                          disabled={busy === item.id}
                          onClick={() =>
                            void decide(item, "published", t("खबर पब्लिश कर दी गई", "Story published"))
                          }
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
                          disabled={busy === item.id}
                          className="text-destructive"
                          onClick={() =>
                            void decide(item, "rejected", t("खबर रिजेक्ट कर दी गई", "Story rejected"))
                          }
                        >
                          <IconX className="size-4" /> {t("रिजेक्ट", "Reject")}
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" asChild className="shrink-0">
                        <Link href={`/admin/news/${item.id}`}>{t("खोलें", "Open")}</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {/* An administrator sees the whole desk's record, not just the stories. */}
      {role === "administrator" ? <ReviewActivityCard activity={activity} /> : null}
    </div>
  );
}
