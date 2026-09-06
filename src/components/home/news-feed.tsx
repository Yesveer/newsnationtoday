import { FeedItem } from "@/components/article/feed-item";
import { PromoBanner } from "@/components/home/promo-banner";
import type { ArticleWithRelations } from "@/types/article";

const PROMO_EVERY = 6;
const LEAD_EVERY = 8;

export function NewsFeed({ articles }: { articles: ArticleWithRelations[] }) {
  return (
    <div className="flex flex-col">
      {articles.map((article, index) => (
        <div key={article.id}>
          {index > 0 && index % PROMO_EVERY === 0 && (
            <div className="py-4">
              <PromoBanner />
            </div>
          )}
          <FeedItem article={article} variant={index % LEAD_EVERY === 0 ? "lead" : "compact"} />
        </div>
      ))}
    </div>
  );
}
