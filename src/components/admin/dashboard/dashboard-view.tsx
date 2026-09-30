"use client";

import Link from "next/link";
import {
  IconAlertTriangle,
  IconChecklist,
  IconEye,
  IconFileText,
  IconPencilPlus,
  IconPlus,
  IconUsers,
  IconVideo,
  IconClock,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatCard } from "@/components/admin/stat-card";
import { NewsMiniList } from "@/components/admin/news-mini-list";
import { RoleBadge } from "@/components/admin/role-badge";
import { TrafficChart } from "@/components/admin/dashboard/traffic-chart";
import { CategoryChart } from "@/components/admin/dashboard/category-chart";
import { useAdminSession } from "@/components/admin/admin-session";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { formatCompact, formatNumber, formatRelative } from "@/lib/admin/format";
import { toneDotStyle } from "@/lib/admin/tone";
import type { AdminUser, AuditLog, NewsItem } from "@/types/admin";
import type { DashboardStats } from "@/lib/data/admin/get-admin-data";

export function DashboardView({
  stats,
  traffic,
  breakdown,
  reviewQueue,
  recentNews,
  auditLogs,
  users,
}: {
  stats: DashboardStats;
  traffic: { date: string; views: number; stories: number }[];
  breakdown: { category: string; views: number }[];
  reviewQueue: NewsItem[];
  recentNews: NewsItem[];
  auditLogs: AuditLog[];
  users: AdminUser[];
}) {
  const { role, user, can } = useAdminSession();
  const { t } = useAdminLang();
  const isReporter = role === "reporter";
  const myNews = recentNews.filter((item) => item.authorId === user.id);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
              {t("नमस्ते", "Hello")}, {user.name.split(" ")[0]} 👋
            </h1>
            <RoleBadge role={role} />
          </div>
          <p className="text-sm text-text-muted">
            {isReporter
              ? t("आपकी खबरों की स्थिति और रिव्यू कमेंट यहाँ दिखते हैं।", "Your stories' status and review comments, all in one place.")
              : t("आज न्यूज़रूम में क्या चल रहा है, एक नज़र में।", "What's happening in the newsroom today, at a glance.")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {can("news.create") ? (
            <Button asChild size="sm">
              <Link href="/admin/news/new">
                <IconPlus className="size-4" /> {t("नई खबर", "New story")}
              </Link>
            </Button>
          ) : null}
          {can("news.review") ? (
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/review">
                <IconChecklist className="size-4" /> {t("रिव्यू क्यू", "Review queue")} ({reviewQueue.length})
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {isReporter ? (
          <>
            <StatCard
              label={t("मेरी कुल खबरें", "My stories")}
              value={formatNumber(myNews.length)}
              icon={<IconFileText className="size-5" stroke={1.7} />}
              hint={t("इस पोर्टल पर", "On this portal")}
            />
            <StatCard
              label={t("रिव्यू में", "In review")}
              value={myNews.filter((item) => item.status === "in_review").length}
              icon={<IconClock className="size-5" stroke={1.7} />}
              hint={t("एडमिन के पास", "With the desk")}
            />
            <StatCard
              label={t("बदलाव मांगे गए", "Changes asked")}
              value={myNews.filter((item) => item.status === "changes_requested").length}
              icon={<IconAlertTriangle className="size-5" stroke={1.7} />}
              hint={t("आपकी कार्रवाई चाहिए", "Needs your action")}
            />
            <StatCard
              label={t("पब्लिश्ड व्यूज़", "Published views")}
              value={formatCompact(
                myNews.filter((item) => item.status === "published").reduce((sum, item) => sum + item.views, 0),
              )}
              icon={<IconEye className="size-5" stroke={1.7} />}
              trend={12}
            />
          </>
        ) : (
          <>
            <StatCard
              label={t("कुल व्यूज़ (14 दिन)", "Total views (14 days)")}
              value={formatCompact(stats.totalViews)}
              icon={<IconEye className="size-5" stroke={1.7} />}
              trend={8.4}
            />
            <StatCard
              label={t("पब्लिश्ड खबरें", "Published stories")}
              value={formatNumber(stats.published)}
              icon={<IconFileText className="size-5" stroke={1.7} />}
              hint={`${stats.scheduled} ${t("शेड्यूल्ड", "scheduled")}`}
            />
            <StatCard
              label={t("रिव्यू के इंतज़ार में", "Waiting for review")}
              value={stats.inReview}
              icon={<IconChecklist className="size-5" stroke={1.7} />}
              hint={`${stats.drafts} ${t("ड्राफ़्ट", "drafts")}`}
            />
            <StatCard
              label={
                role === "administrator"
                  ? t("एक्टिव यूज़र", "Active users")
                  : t("वीडियो स्टोरीज़", "Video stories")
              }
              value={role === "administrator" ? stats.activeUsers : stats.videos}
              icon={
                role === "administrator" ? (
                  <IconUsers className="size-5" stroke={1.7} />
                ) : (
                  <IconVideo className="size-5" stroke={1.7} />
                )
              }
              hint={
                role === "administrator"
                  ? `${stats.reporters} ${t("रिपोर्टर", "reporters")}`
                  : t("लाइव और ऑन-डिमांड", "Live and on-demand")
              }
            />
          </>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <TrafficChart data={traffic} />
        <CategoryChart data={breakdown} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="gap-0 py-0">
          <CardHeader className="!flex flex-row items-center justify-between gap-2 border-b py-4">
            <div>
              <CardTitle className="font-display text-base font-bold">
                {isReporter ? t("मेरी हाल की खबरें", "My recent stories") : t("रिव्यू क्यू", "Review queue")}
              </CardTitle>
              <CardDescription>
                {isReporter
                  ? t("स्थिति और एडमिन के कमेंट", "Status and desk comments")
                  : t("रिपोर्टर्स ने भेजी हुई खबरें", "Stories sent in by reporters")}
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href={isReporter ? "/admin/news" : "/admin/review"}>{t("सभी देखें", "View all")}</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <NewsMiniList
              items={(isReporter ? myNews : reviewQueue).slice(0, 5)}
              emptyText={
                isReporter
                  ? t("अभी कोई खबर नहीं — नई खबर जोड़ें।", "No stories yet — add your first one.")
                  : t("क्यू खाली है, सब निपट गया।", "The queue is empty, all caught up.")
              }
            />
          </CardContent>
        </Card>

        {role === "administrator" ? (
          <Card className="gap-0 py-0">
            <CardHeader className="!flex flex-row items-center justify-between gap-2 border-b py-4">
              <div>
                <CardTitle className="font-display text-base font-bold">{t("हाल की गतिविधि", "Recent activity")}</CardTitle>
                <CardDescription>{t("ऑडिट लॉग से", "From the audit log")}</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/audit-logs">{t("पूरा लॉग", "Full log")}</Link>
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ul className="divide-y divide-border">
                {auditLogs.slice(0, 6).map((log) => (
                  <li key={log.id} className="flex items-start gap-3 px-4 py-3">
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full"
                      style={toneDotStyle(
                        log.severity === "critical" ? "strong" : log.severity === "warning" ? "medium" : "soft",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug text-text">{log.description}</p>
                      <p className="mt-0.5 text-[11px] text-text-muted">
                        {log.actorName} · {formatRelative(log.at)} · <code className="text-[10px]">{log.action}</code>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <Card className="gap-0 py-0">
            <CardHeader className="!flex flex-row items-center justify-between gap-2 border-b py-4">
              <div>
                <CardTitle className="font-display text-base font-bold">
                  {isReporter ? t("एडमिन के कमेंट", "Desk comments") : t("टीम", "Team")}
                </CardTitle>
                <CardDescription>
                  {isReporter
                    ? t("आपकी खबरों पर मिले फ़ीडबैक", "Feedback on your stories")
                    : t("आज सबसे सक्रिय रिपोर्टर", "Most active reporters today")}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {isReporter ? (
                <ul className="divide-y divide-border">
                  {myNews
                    .flatMap((item) => item.comments.map((comment) => ({ comment, item })))
                    .slice(0, 5)
                    .map(({ comment, item }) => (
                      <li key={comment.id} className="px-4 py-3">
                        <Link href={`/admin/news/${item.id}`} className="block space-y-1">
                          <p className="line-clamp-1 text-[12px] font-semibold text-accent">{item.title}</p>
                          <p className="line-clamp-2 text-[13px] leading-snug text-text">{comment.body}</p>
                          <p className="text-[11px] text-text-muted">
                            {comment.authorName} · {formatRelative(comment.createdAt)}
                          </p>
                        </Link>
                      </li>
                    ))}
                  {myNews.every((item) => item.comments.length === 0) ? (
                    <p className="px-4 py-8 text-center text-sm text-text-muted">{t("अभी कोई कमेंट नहीं।", "No comments yet.")}</p>
                  ) : null}
                </ul>
              ) : (
                <ul className="divide-y divide-border">
                  {users
                    .filter((item) => item.status === "active")
                    .slice(0, 6)
                    .map((member) => (
                      <li key={member.id} className="flex items-center gap-3 px-4 py-2.5">
                        <Avatar className="size-8">
                          <AvatarImage src={member.avatarUrl} alt={member.name} />
                          <AvatarFallback className="text-xs">{member.name.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-text">{member.name}</p>
                          <p className="truncate text-[11px] text-text-muted">{member.desk}</p>
                        </div>
                        <RoleBadge role={member.role} size="xs" />
                        <span className="w-12 text-right text-[12px] font-semibold tabular-nums text-text-muted">
                          {member.storiesCount}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {can("news.create") ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <IconPencilPlus className="size-8 text-accent" stroke={1.5} />
            <div>
              <p className="font-display text-base font-bold">{t("कुछ नया रिपोर्ट करना है?", "Got something to report?")}</p>
              <p className="text-sm text-text-muted">
                {t(
                  "खबर लिखें, फोटो-वीडियो जोड़ें और रिव्यू के लिए भेज दें।",
                  "Write the story, add photos or video, and send it for review.",
                )}
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/admin/news/new">{t("नई खबर शुरू करें", "Start a new story")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
