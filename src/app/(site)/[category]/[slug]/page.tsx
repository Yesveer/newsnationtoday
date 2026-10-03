import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleByCategoryAndSlug, getRelatedArticles } from "@/lib/data/get-articles";
import { ArticleHeader } from "@/components/article/article-header";
import { ArticleBody } from "@/components/article/article-body";
import { ArticleCredits } from "@/components/article/article-credits";
import { ArticleSocialLinks } from "@/components/article/article-social-links";
import { RelatedArticles } from "@/components/article/related-articles";
import { readingMinutes } from "@/lib/sanitize-story";
import { siteConfig } from "@/config/site";

// No generateStaticParams: stories now come from the newsroom database, so a
// story published a minute ago has to render on demand rather than wait for a
// build.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const article = await getArticleByCategoryAndSlug(category, slug);
  if (!article) return {};

  const title = article.seo.metaTitle ?? article.title;
  const description = article.seo.metaDescription ?? article.excerpt;
  const image = article.seo.ogImageUrl ?? article.coverImageUrl;

  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/${category}/${slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${siteConfig.url}/${category}/${slug}`,
      images: image ? [image] : undefined,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const article = await getArticleByCategoryAndSlug(category, slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article, 3);
  const minutes = article.readingTimeMinutes ?? readingMinutes(article.bodyHtml);

  // Search engines and aggregators read the byline chain from here, not from
  // the visible markup — so it stays in step with what the page shows.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: [{ "@type": "Person", name: article.author.name }],
    publisher: { "@type": "Organization", name: siteConfig.name },
    articleSection: article.category.name,
    keywords: article.tags?.join(", "),
  };

  return (
    <div className="flex flex-col gap-6">
      <ArticleHeader article={article} />
      <ArticleCredits article={{ ...article, readingTimeMinutes: minutes }} />
      <ArticleBody bodyHtml={article.bodyHtml} />
      <ArticleSocialLinks links={article.socialLinks} />
      <RelatedArticles articles={related} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
