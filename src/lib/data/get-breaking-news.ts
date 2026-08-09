import { breakingNews } from "@/data/breaking-news";
import type { BreakingNewsItem } from "@/types/breaking-news";

export async function getActiveBreakingNews(): Promise<BreakingNewsItem[]> {
  return breakingNews
    .filter((item) => item.isActive)
    .sort((a, b) => a.priority - b.priority);
}
