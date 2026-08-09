import Link from "next/link";
import type { BreakingNewsItem } from "@/types/breaking-news";

export function TickerBar({ items }: { items: BreakingNewsItem[] }) {
  const looped = [...items, ...items];

  return (
    <div className="relative flex items-center gap-3 border-b border-border bg-surface-muted/60 px-4 py-2 sm:px-6 lg:px-8">
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-live px-2.5 py-1 text-xs font-bold text-live-foreground">
        <span className="animate-live-pulse size-1.5 rounded-full bg-live-foreground" aria-hidden />
        ब्रेकिंग
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="animate-marquee flex w-max gap-10 text-sm whitespace-nowrap">
          {looped.map((item, i) =>
            item.href ? (
              <Link key={`${item.id}-${i}`} href={item.href} className="text-text transition-colors hover:text-accent">
                {item.text}
              </Link>
            ) : (
              <span key={`${item.id}-${i}`} className="text-text">
                {item.text}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
