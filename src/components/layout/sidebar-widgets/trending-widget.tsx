import Link from "next/link";
import { Flame } from "lucide-react";
import { getFeedArticles } from "@/lib/data/get-articles";

/** "Most read" proxy — no real view-count field yet (Phase 2 TODO). The list
 *  scrolls on a loop (duplicated once) and pauses on hover/focus. */
export async function TrendingWidget() {
  const articles = (await getFeedArticles({ limit: 8 }));
  if (articles.length === 0) return null;

  const looped = [...articles, ...articles];

  return (
    <div className="rounded-xl border border-border bg-surface">
      <h2 className="flex items-center gap-1.5 border-b border-border px-4 py-3 text-sm font-bold text-text">
        <Flame className="size-4 text-live" /> अभी ट्रेंड में
      </h2>
      <div className="relative h-80 overflow-hidden">
        <ol className="animate-marquee-vertical flex flex-col">
          {looped.map((article, index) => (
            <li key={`${article.id}-${index}`} className="flex gap-2.5 border-b border-border px-4 py-3 last:border-b-0">
              <span className="text-lg leading-none font-bold text-accent">{(index % articles.length) + 1}</span>
              <Link
                href={`/${article.category.slug}/${article.slug}`}
                className="line-clamp-2 text-sm leading-snug font-medium text-text transition-colors hover:text-accent"
              >
                {article.title}
              </Link>
            </li>
          ))}
        </ol>
        {/* soft fade at the edges so items don't cut off hard */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-surface to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-surface to-transparent" />
      </div>
    </div>
  );
}
