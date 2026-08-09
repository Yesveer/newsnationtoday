import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug } from "@/lib/data/get-categories";
import { getArticlesByCategory } from "@/lib/data/get-articles";
import { NewsFeed } from "@/components/home/news-feed";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return {};

  return {
    title: category.name,
    description: `${category.name} से जुड़ी ताज़ा खबरें।`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const articles = await getArticlesByCategory(categorySlug);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="border-b border-border pb-3 text-2xl font-bold text-text">{category.name}</h1>

      {articles.length === 0 ? (
        <p className="text-text-muted">इस श्रेणी में फ़िलहाल कोई खबर उपलब्ध नहीं है।</p>
      ) : (
        <NewsFeed articles={articles} />
      )}
    </div>
  );
}
