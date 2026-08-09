import { FeedItem } from "@/components/article/feed-item";
import type { ArticleWithRelations } from "@/types/article";

export function RelatedArticles({ articles }: { articles: ArticleWithRelations[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="flex flex-col border-t border-border pt-2">
      <h2 className="pb-1 text-lg font-bold text-text">आगे पढ़ें</h2>
      <div className="flex flex-col">
        {articles.map((article) => (
          <FeedItem key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
