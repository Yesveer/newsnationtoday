import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleByCategoryAndSlug, getRelatedArticles } from "@/lib/data/get-articles";
import { ArticleHeader } from "@/components/article/article-header";
import { ArticleBody } from "@/components/article/article-body";
import { RelatedArticles } from "@/components/article/related-articles";

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({ category: article.category.slug, slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const article = await getArticleByCategoryAndSlug(category, slug);
  if (!article) return {};

  return {
    title: article.seo.metaTitle ?? article.title,
    description: article.seo.metaDescription ?? article.excerpt,
    openGraph: article.seo.ogImageUrl ? { images: [article.seo.ogImageUrl] } : undefined,
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

  return (
    <div className="flex flex-col gap-6">
      <ArticleHeader article={article} />
      <ArticleBody bodyHtml={article.bodyHtml} />
      <RelatedArticles articles={related} />
    </div>
  );
}
