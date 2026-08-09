export interface SeoFields {
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
}

export interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  bodyHtml: string;
  coverImageUrl: string;
  coverImageAlt: string;
  gallery?: GalleryImage[];
  categoryId: string;
  authorId: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  isBreaking: boolean;
  isVideo?: boolean;
  videoDurationLabel?: string;
  location?: { state?: string; city?: string };
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  readingTimeMinutes?: number;
  seo: SeoFields;
}

/** Article with its category/author relations resolved, as `lib/data` returns it. */
export interface ArticleWithRelations extends Article {
  category: import("@/types/category").Category;
  author: import("@/types/author").Author;
}
