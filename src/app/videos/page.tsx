import type { Metadata } from "next";
import { getVideoArticles } from "@/lib/data/get-articles";
import { NewsFeed } from "@/components/home/news-feed";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "वीडियो",
  description: `${siteConfig.name} के सभी वीडियो एक ही जगह।`,
};

export default async function VideosPage() {
  const articles = await getVideoArticles();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="border-b border-border pb-3 text-2xl font-bold text-text">वीडियो</h1>

      {articles.length === 0 ? (
        <p className="text-text-muted">फ़िलहाल कोई वीडियो उपलब्ध नहीं है।</p>
      ) : (
        <NewsFeed articles={articles} />
      )}
    </div>
  );
}
