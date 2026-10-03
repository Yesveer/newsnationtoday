import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/data/get-categories";
import { getArticlesByCategory } from "@/lib/data/get-articles";
import { NewsFeed } from "@/components/home/news-feed";
import { TopicExplorer } from "@/components/topics/topic-explorer";
import { CategoryHeading } from "@/components/topics/category-heading";
import { categoryTopics } from "@/config/topics.config";
import { getTopicsForCategory } from "@/lib/data/get-topics";
import type { TranslationKey } from "@/lib/i18n/dictionary";

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
  // The tiles come from the database; the static config only still supplies
  // the search placeholder wording for the special hubs.
  const topics = await getTopicsForCategory(categorySlug);
  const searchKey = (categoryTopics[categorySlug]?.searchKey ?? "topic.search") as TranslationKey;

  return (
    <div className="flex flex-col gap-5">
      <CategoryHeading name={category.name} nameEn={category.nameEn ?? category.name} />

      {topics.length > 0 ? (
        <TopicExplorer articles={articles} topics={topics} searchKey={searchKey} />
      ) : articles.length === 0 ? (
        <p className="text-text-muted">इस श्रेणी में फ़िलहाल कोई खबर उपलब्ध नहीं है।</p>
      ) : (
        <NewsFeed articles={articles} />
      )}
    </div>
  );
}
