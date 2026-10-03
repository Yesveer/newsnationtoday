import type { ArticleWithRelations } from "@/types/article";
import type { Category } from "@/types/category";
import type { Topic } from "@/config/topics.config";

/** Server-side reads of the public API.
 *
 *  These run in server components, so no token is involved — the endpoints are
 *  the same ones a browser could call. If the API is unreachable the helpers
 *  return empty results and the page renders its empty state instead of
 *  crashing the whole site. */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090/api/v1";

interface ApiArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  coverImageAlt?: string;
  categorySlug: string;
  topic?: string;
  type: "article" | "video" | "photo";
  status: string;
  authorId?: string;
  authorName: string;
  reviewedByName?: string;
  publishedByName?: string;
  socialLinks?: { platform: string; url: string; label?: string }[];
  tags: string[];
  isBreaking: boolean;
  isFeatured: boolean;
  videoDurationLabel?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  seo?: { metaTitle?: string; metaDescription?: string; keywords?: string };
}

interface ApiTopic {
  slug: string;
  name: string;
  nameEn: string;
  badge?: string;
  color: string;
  iconUrl?: string;
  order: number;
}

export interface ApiCategory {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  color: string;
  iconUrl?: string;
  order: number;
  isNew: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

async function get<T>(path: string): Promise<T | null> {
  try {
    // no-store, because an edit in the admin portal should show on the site
    // immediately rather than after a cache window.
    const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    // The API being down must not take the website down with it.
    return null;
  }
}

function toCategory(category: ApiCategory): Category {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    nameEn: category.nameEn,
    color: category.color,
    iconUrl: category.iconUrl,
    order: category.order,
    parentId: null,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

/** Builds the author object the article components expect out of the single
 *  name the API stores on a story. */
function toAuthor(article: ApiArticle) {
  const slug = article.authorName
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return {
    id: article.authorId || slug || "newsroom",
    slug: slug || "newsroom",
    name: article.authorName,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

export function toArticle(article: ApiArticle, categories: Map<string, Category>): ArticleWithRelations {
  const category = categories.get(article.categorySlug) ?? {
    id: article.categorySlug,
    slug: article.categorySlug,
    name: article.categorySlug,
    order: 99,
    parentId: null,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    bodyHtml: article.body,
    coverImageUrl: article.coverImageUrl,
    coverImageAlt: article.coverImageAlt ?? article.title,
    categoryId: category.id,
    authorId: article.authorId ?? "",
    reviewedByName: article.reviewedByName,
    publishedByName: article.publishedByName,
    socialLinks: article.socialLinks ?? [],
    tags: article.tags ?? [],
    status: "published",
    isFeatured: article.isFeatured,
    isBreaking: article.isBreaking,
    isVideo: article.type === "video",
    videoDurationLabel: article.videoDurationLabel,
    topic: article.topic,
    publishedAt: article.publishedAt ?? article.createdAt,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    seo: {
      metaTitle: article.seo?.metaTitle,
      metaDescription: article.seo?.metaDescription,
    },
    category,
    author: toAuthor(article),
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const data = await get<{ categories: ApiCategory[] }>("/public/categories");
  return (data?.categories ?? []).map(toCategory);
}

async function categoryMap(): Promise<Map<string, Category>> {
  const categories = await fetchCategories();
  return new Map(categories.map((category) => [category.slug, category]));
}

export interface FeedQuery {
  category?: string;
  topic?: string;
  type?: "article" | "video" | "photo";
  featured?: boolean;
  breaking?: boolean;
  search?: string;
  exclude?: string[];
  limit?: number;
  page?: number;
}

export async function fetchArticles(query: FeedQuery = {}): Promise<ArticleWithRelations[]> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.topic) params.set("topic", query.topic);
  if (query.type) params.set("type", query.type);
  if (query.featured !== undefined) params.set("featured", String(query.featured));
  if (query.breaking !== undefined) params.set("breaking", String(query.breaking));
  if (query.search) params.set("search", query.search);
  if (query.exclude?.length) params.set("exclude", query.exclude.join(","));
  params.set("limit", String(query.limit ?? 50));
  params.set("page", String(query.page ?? 1));

  const [data, categories] = await Promise.all([
    get<{ articles: ApiArticle[] }>(`/public/articles?${params.toString()}`),
    categoryMap(),
  ]);
  return (data?.articles ?? []).map((article) => toArticle(article, categories));
}

export async function fetchArticle(
  categorySlug: string,
  slug: string,
): Promise<{ article: ArticleWithRelations; related: ArticleWithRelations[] } | null> {
  const [data, categories] = await Promise.all([
    get<{ article: ApiArticle; related: ApiArticle[] }>(
      `/public/articles/${encodeURIComponent(categorySlug)}/${encodeURIComponent(slug)}`,
    ),
    categoryMap(),
  ]);
  if (!data?.article) return null;

  return {
    article: toArticle(data.article, categories),
    related: (data.related ?? []).map((item) => toArticle(item, categories)),
  };
}

/** The sub-topics a category page shows as tiles. */
export async function fetchTopics(categorySlug: string): Promise<Topic[]> {
  const data = await get<{ topics: ApiTopic[] }>(
    `/public/topics?category=${encodeURIComponent(categorySlug)}`,
  );
  return (data?.topics ?? []).map((topic) => ({
    slug: topic.slug,
    name: topic.name,
    nameEn: topic.nameEn,
    badge: topic.badge ?? "",
    color: topic.color,
    iconUrl: topic.iconUrl,
  }));
}

/** The site configuration the newsroom edits in the admin portal. */
export async function fetchSiteConfig<T>(): Promise<T | null> {
  const data = await get<{ config: T }>("/public/config");
  return data?.config ?? null;
}
