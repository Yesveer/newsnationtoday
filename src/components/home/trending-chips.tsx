"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { trendingTopics } from "@/config/trending.config";
import { useLanguage } from "@/components/i18n/language-provider";

export function TrendingChips() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-border pb-3">
      <span className="shrink-0 text-sm font-bold text-live">{t("label.trending")}</span>
      {trendingTopics.map((topic) => (
        <Link
          key={topic.href}
          href={topic.href}
          className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-accent hover:text-accent"
        >
          {topic.label} <ChevronRight className="size-3" />
        </Link>
      ))}
    </div>
  );
}
