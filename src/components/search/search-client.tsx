"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FeedItem } from "@/components/article/feed-item";
import type { ArticleWithRelations } from "@/types/article";

export function SearchClient({ articles }: { articles: ArticleWithRelations[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [articles, query]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text">खोजें</h1>
        <p className="text-sm text-text-muted">
          यह एक शुरुआती खोज सुविधा है — फ़िलहाल यह केवल पहले से लोड की गई खबरों में खोजती है।
        </p>
        <div className="relative mt-2">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="खबर, टैग या विषय खोजें..."
            className="w-full rounded-full border border-border bg-surface py-3 pr-4 pl-10 text-sm text-text outline-none focus-visible:border-accent"
            autoFocus
          />
        </div>
      </div>

      {query.trim() && (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-text-muted">{results.length} परिणाम मिले</p>
          {results.length > 0 ? (
            <div className="flex flex-col">
              {results.map((article) => (
                <FeedItem key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-text-muted">कोई खबर नहीं मिली। कोई दूसरा शब्द आज़माएं।</p>
          )}
        </div>
      )}
    </div>
  );
}
