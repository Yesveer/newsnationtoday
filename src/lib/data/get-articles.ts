import { fetchArticle, fetchArticles } from "@/lib/api/public";
import type { ArticleWithRelations } from "@/types/article";

/** Every read the public site does goes through here, and every one of these
 *  now comes from the newsroom database via the API — what an editor publishes
 *  in the admin portal is what a reader gets. */

/** Flat reverse-chronological feed across every category — the homepage's main column. */
export async function getFeedArticles(options?: {
  limit?: number;
  excludeIds?: string[];
}): Promise<ArticleWithRelations[]> {
  return fetchArticles({ limit: options?.limit ?? 50, exclude: options?.excludeIds });
}

export async function getArticlesByCategory(
  categorySlug: string,
  options?: { excludeIds?: string[]; limit?: number },
): Promise<ArticleWithRelations[]> {
  return fetchArticles({
    category: categorySlug,
    limit: options?.limit ?? 50,
    exclude: options?.excludeIds,
  });
}

export async function getArticleByCategoryAndSlug(
  categorySlug: string,
  slug: string,
): Promise<ArticleWithRelations | null> {
  const result = await fetchArticle(categorySlug, slug);
  return result?.article ?? null;
}

export async function getRelatedArticles(
  article: ArticleWithRelations,
  count = 3,
): Promise<ArticleWithRelations[]> {
  const related = await fetchArticles({
    category: article.category.slug,
    exclude: [article.id],
    limit: count,
  });
  return related.slice(0, count);
}

/** Every published article, for the client-side search placeholder. */
export async function getAllArticles(): Promise<ArticleWithRelations[]> {
  return fetchArticles({ limit: 100 });
}

/** Lead stories for the homepage hero — featured first, then the most recent. */
export async function getHeroArticles(count = 8): Promise<ArticleWithRelations[]> {
  const [featured, latest] = await Promise.all([
    fetchArticles({ featured: true, limit: count }),
    fetchArticles({ limit: count }),
  ]);

  const seen = new Set(featured.map((article) => article.id));
  const filler = latest.filter((article) => !seen.has(article.id));
  return [...featured, ...filler].slice(0, count);
}

/** Stories with a finished 9:16 cut — the reels feed at /videos.
 *
 *  Keyed on the reel rather than on a "video" label, because the label only
 *  ever meant someone attached a clip; the feed can only play what has
 *  actually been cut to vertical. */
export async function getReelArticles(): Promise<ArticleWithRelations[]> {
  return fetchArticles({ hasReel: true, limit: 50 });
}
