import { fetchArticles } from "@/lib/api/public";
import type { BreakingNewsItem } from "@/types/breaking-news";

/** The breaking ticker is driven by the "ब्रेकिंग" switch on a story, so an
 *  editor flipping it in the portal changes what scrolls on the site. */
export async function getActiveBreakingNews(): Promise<BreakingNewsItem[]> {
  const articles = await fetchArticles({ breaking: true, limit: 8 });

  return articles.map((article, index) => ({
    id: article.id,
    text: article.title,
    href: `/${article.category.slug}/${article.slug}`,
    isActive: true,
    priority: index + 1,
    startsAt: article.publishedAt,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  }));
}
