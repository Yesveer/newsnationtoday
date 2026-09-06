import { articles } from "@/data/articles";
import { authors } from "@/data/authors";
import { categories } from "@/data/categories";
import type { Article, ArticleWithRelations } from "@/types/article";

function resolve(article: Article): ArticleWithRelations {
  const category = categories.find((c) => c.id === article.categoryId);
  const author = authors.find((a) => a.id === article.authorId);
  if (!category || !author) {
    throw new Error(`Article ${article.slug} has a dangling category/author reference`);
  }
  return { ...article, category, author };
}

function publishedSortedByDate(): Article[] {
  return articles
    .filter((article) => article.status === "published")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

/** Flat reverse-chronological feed across every category — the homepage's main column. */
export async function getFeedArticles(options?: { limit?: number; excludeIds?: string[] }): Promise<ArticleWithRelations[]> {
  const excludeIds = options?.excludeIds ?? [];
  const results = publishedSortedByDate()
    .filter((article) => !excludeIds.includes(article.id))
    .map(resolve);

  return options?.limit ? results.slice(0, options.limit) : results;
}

export async function getArticlesByCategory(
  categorySlug: string,
  options?: { excludeIds?: string[]; limit?: number },
): Promise<ArticleWithRelations[]> {
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return [];

  const excludeIds = options?.excludeIds ?? [];
  const results = publishedSortedByDate()
    .filter((article) => article.categoryId === category.id && !excludeIds.includes(article.id))
    .map(resolve);

  return options?.limit ? results.slice(0, options.limit) : results;
}

export async function getArticleByCategoryAndSlug(
  categorySlug: string,
  slug: string,
): Promise<ArticleWithRelations | null> {
  const article = articles.find(
    (a) => a.slug === slug && a.status === "published",
  );
  if (!article) return null;

  const resolved = resolve(article);
  if (resolved.category.slug !== categorySlug) return null;

  return resolved;
}

export async function getRelatedArticles(
  article: ArticleWithRelations,
  count = 3,
): Promise<ArticleWithRelations[]> {
  return publishedSortedByDate()
    .filter((a) => a.categoryId === article.categoryId && a.id !== article.id)
    .slice(0, count)
    .map(resolve);
}

/** Every published article, for the client-side search placeholder. */
export async function getAllArticles(): Promise<ArticleWithRelations[]> {
  return publishedSortedByDate().map(resolve);
}

/** Lead stories for the homepage hero — featured first, then the most recent. */
export async function getHeroArticles(count = 8): Promise<ArticleWithRelations[]> {
  const published = publishedSortedByDate();
  const featured = published.filter((article) => article.isFeatured);
  const rest = published.filter((article) => !article.isFeatured);

  return [...featured, ...rest].slice(0, count).map(resolve);
}

/** Video-flagged articles, for the /videos hub. */
export async function getVideoArticles(): Promise<ArticleWithRelations[]> {
  return publishedSortedByDate()
    .filter((article) => article.isVideo)
    .map(resolve);
}
