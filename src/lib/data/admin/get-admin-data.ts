import { newsItems } from "@/data/admin/news-items";
import { adminUsers } from "@/data/admin/users";
import { auditLogs } from "@/data/admin/audit-logs";
import { mediaItems } from "@/data/admin/media";
import { deletionRequests } from "@/data/admin/deletion-requests";
import type { AdminUser, AuditLog, DeletionRequest, MediaItem, NewsItem, NewsStatus } from "@/types/admin";

/** Same seam the public site uses: components await these, never the arrays,
 *  so swapping in the Go API is a one-file change. */

function byUpdatedDesc(a: NewsItem, b: NewsItem) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

export async function getNewsItems(options?: {
  status?: NewsStatus;
  authorId?: string;
  categorySlug?: string;
  limit?: number;
}): Promise<NewsItem[]> {
  let results = [...newsItems].sort(byUpdatedDesc);
  if (options?.status) results = results.filter((item) => item.status === options.status);
  if (options?.authorId) results = results.filter((item) => item.authorId === options.authorId);
  if (options?.categorySlug) results = results.filter((item) => item.categorySlug === options.categorySlug);
  return options?.limit ? results.slice(0, options.limit) : results;
}

export async function getNewsItem(id: string): Promise<NewsItem | undefined> {
  return newsItems.find((item) => item.id === id);
}

export async function getReviewQueue(): Promise<NewsItem[]> {
  return newsItems
    .filter((item) => item.status === "in_review" || item.status === "changes_requested")
    .sort(byUpdatedDesc);
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return adminUsers;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  return [...auditLogs].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export async function getMediaItems(): Promise<MediaItem[]> {
  return mediaItems;
}

export async function getDeletionRequests(): Promise<DeletionRequest[]> {
  return [...deletionRequests].sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
  );
}

export interface DashboardStats {
  total: number;
  published: number;
  inReview: number;
  drafts: number;
  scheduled: number;
  rejected: number;
  breaking: number;
  videos: number;
  totalViews: number;
  pendingRequests: number;
  activeUsers: number;
  reporters: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const count = (status: NewsStatus) => newsItems.filter((item) => item.status === status).length;
  return {
    total: newsItems.length,
    published: count("published"),
    inReview: count("in_review") + count("changes_requested"),
    drafts: count("draft"),
    scheduled: count("scheduled"),
    rejected: count("rejected"),
    breaking: newsItems.filter((item) => item.isBreaking).length,
    videos: newsItems.filter((item) => item.type === "video").length,
    totalViews: newsItems.reduce((sum, item) => sum + item.views, 0),
    pendingRequests: deletionRequests.filter((request) => request.status === "pending").length,
    activeUsers: adminUsers.filter((user) => user.status === "active").length,
    reporters: adminUsers.filter((user) => user.role === "reporter").length,
  };
}

/** Last 14 days of traffic for the dashboard chart — deterministic mock. */
export async function getTrafficSeries(): Promise<{ date: string; views: number; stories: number }[]> {
  return Array.from({ length: 14 }, (_, index) => {
    const day = new Date(Date.UTC(2026, 8, 12 + index));
    const wave = Math.sin(index / 2) * 9000;
    return {
      date: day.toISOString().slice(0, 10),
      views: Math.round(42000 + wave + index * 1450),
      stories: 8 + ((index * 3) % 7),
    };
  });
}

/** Views split by category, for the dashboard's donut. */
export async function getCategoryBreakdown(): Promise<{ category: string; views: number }[]> {
  const totals = new Map<string, number>();
  for (const item of newsItems) {
    totals.set(item.categorySlug, (totals.get(item.categorySlug) ?? 0) + item.views);
  }
  return [...totals.entries()]
    .map(([category, views]) => ({ category, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);
}
