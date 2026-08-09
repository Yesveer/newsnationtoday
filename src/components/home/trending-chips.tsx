import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { trendingTopics } from "@/config/trending.config";

export function TrendingChips() {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
        <span className="shrink-0 text-sm font-semibold text-accent">ट्रेंडिंग</span>
        {trendingTopics.map((topic) => (
          <Link
            key={topic.href}
            href={topic.href}
            className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-text transition-colors hover:border-accent hover:text-accent"
          >
            {topic.label} <ChevronRight className="size-3" />
          </Link>
        ))}
      </div>
    </div>
  );
}
