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

/** A link to this story on a social platform, entered by the newsroom. */
export interface ArticleSocialLink {
  platform: string;
  url: string;
  label?: string;
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
  /** The desk credits a reader sees: who filed it, who checked it, who ran it. */
  reviewedByName?: string;
  publishedByName?: string;
  socialLinks?: ArticleSocialLink[];
  tags: string[];
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  isBreaking: boolean;
  isVideo?: boolean;
  videoDurationLabel?: string;
  /** Sub-topic within a category — a state, country or sport slug (see topics.config). */
  topic?: string;
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
