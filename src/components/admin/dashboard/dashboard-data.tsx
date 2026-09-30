"use client";

import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardView } from "@/components/admin/dashboard/dashboard-view";
import { useAdminSession } from "@/components/admin/admin-session";
import * as api from "@/lib/api/admin";
import type { DashboardStats } from "@/lib/data/admin/get-admin-data";
import type { AdminUser, AuditLog, NewsItem } from "@/types/admin";

/** Loads everything the dashboard shows. Counts, views and the story lists are
 *  real; only the day-by-day traffic line is still sample data, because the API
 *  does not record views per day yet. */
export function DashboardData() {
  const { role, can } = useAdminSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    stats: DashboardStats;
    breakdown: { category: string; views: number }[];
    reviewQueue: NewsItem[];
    recentNews: NewsItem[];
    auditLogs: AuditLog[];
    users: AdminUser[];
  } | null>(null);

  const fetchAll = useCallback(async () => {
    const [statsResult, recent, queue, logs, users] = await Promise.all([
      api.getNewsStats().catch(() => null),
      api.listNews({ limit: 40 }).catch(() => null),
      can("news.review") ? api.listNews({ status: "in_review", limit: 10 }).catch(() => null) : null,
      role === "administrator" ? api.listAuditLogs({ limit: 8 }).catch(() => null) : null,
      role === "administrator" ? api.listUsers({ limit: 10 }).catch(() => null) : null,
    ]);

    const counts = statsResult?.counts ?? {};
    const stats: DashboardStats = {
      total: Object.values(counts).reduce((sum, value) => sum + (value ?? 0), 0),
      published: counts.published ?? 0,
      inReview: (counts.in_review ?? 0) + (counts.changes_requested ?? 0),
      drafts: counts.draft ?? 0,
      scheduled: counts.scheduled ?? 0,
      rejected: counts.rejected ?? 0,
      breaking: 0,
      videos: 0,
      totalViews: statsResult?.totalViews ?? 0,
      pendingRequests: 0,
      activeUsers: statsResult?.activeUsers ?? 0,
      reporters: statsResult?.reporters ?? 0,
    };

    const recentItems = recent?.items ?? [];
    stats.breaking = recentItems.filter((item) => item.isBreaking).length;
    stats.videos = recentItems.filter((item) => item.type === "video").length;
    stats.pendingRequests = recentItems.filter((item) => item.deleteRequested).length;

    return {
      stats,
      breakdown: statsResult?.viewsByCategory ?? [],
      reviewQueue: queue?.items ?? [],
      recentNews: recentItems,
      auditLogs: logs?.items ?? [],
      users: users?.items ?? [],
    };
  }, [role, can]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await fetchAll();
      if (!active) return;
      setData(result);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchAll]);

  if (loading || !data) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16 w-80" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Skeleton className="h-[320px] w-full" />
          <Skeleton className="h-[320px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <DashboardView
      stats={data.stats}
      traffic={sampleTraffic()}
      breakdown={data.breakdown}
      reviewQueue={data.reviewQueue}
      recentNews={data.recentNews}
      auditLogs={data.auditLogs}
      users={data.users}
    />
  );
}

/** Placeholder trend line until the API records views per day. */
function sampleTraffic() {
  return Array.from({ length: 14 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (13 - index));
    return {
      date: day.toISOString().slice(0, 10),
      views: Math.round(42000 + Math.sin(index / 2) * 9000 + index * 1450),
      stories: 8 + ((index * 3) % 7),
    };
  });
}
