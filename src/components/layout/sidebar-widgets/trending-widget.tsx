import Link from "next/link";
import { Flame } from "lucide-react";
import { getAllArticles } from "@/lib/data/get-articles";

/** "Most read" proxy using featured articles — there's no real view-count field yet (Phase 2 TODO). */
export async function TrendingWidget() {
  const articles = (await getAllArticles()).filter((article) => article.isFeatured).slice(0, 5);
  if (articles.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-text">
        <Flame className="size-4 text-live" /> अभी ट्रेंड में
      </h2>
      <ol className="flex flex-col gap-3">
        {articles.map((article, index) => (
          <li key={article.id} className="flex gap-2.5">
            <span className="font-display text-lg leading-none font-bold text-text-muted">{index + 1}</span>
            <Link href={`/${article.category.slug}/${article.slug}`} className="text-sm leading-snug font-medium text-text hover:text-accent">
              {article.title}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
