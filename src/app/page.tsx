import { getFeedArticles, getHeroArticles } from "@/lib/data/get-articles";
import { NewsFeed } from "@/components/home/news-feed";

export default async function HomePage() {
  const heroArticles = await getHeroArticles();
  const articles = await getFeedArticles({
    limit: 30,
    excludeIds: heroArticles.map((article) => article.id),
  });

  return <NewsFeed articles={articles} />;
}
