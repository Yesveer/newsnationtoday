import { getFeedArticles } from "@/lib/data/get-articles";
import { NewsFeed } from "@/components/home/news-feed";

export default async function HomePage() {
  const articles = await getFeedArticles({ limit: 30 });

  return <NewsFeed articles={articles} />;
}
