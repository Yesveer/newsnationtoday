"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Play } from "lucide-react";
import { formatRelativeTime } from "@/lib/format-date";
import { fadeUp } from "@/lib/motion-variants";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/cn";
import type { ArticleWithRelations } from "@/types/article";

/** Dense list row — used below the card grid, and for related/search results. */
export function StoryRow({ article, className }: { article: ArticleWithRelations; className?: string }) {
  const { language } = useLanguage();
  const href = `/${article.category.slug}/${article.slug}`;
  const categoryName = language === "en" ? (article.category.nameEn ?? article.category.name) : article.category.name;
  const color = article.category.color ?? "var(--accent)";

  return (
    <motion.article variants={fadeUp} className={cn("group", className)}>
      <Link href={href} className="flex gap-4 rounded-xl p-2.5 transition-colors hover:bg-surface-muted">
        <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:w-40">
          <Image
            src={article.coverImageUrl}
            alt={article.coverImageAlt}
            fill
            sizes="160px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {article.isVideo && (
            <>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-8 items-center justify-center rounded-full bg-white/90 text-black">
                  <Play className="size-3.5 fill-current" />
                </span>
              </span>
              {article.videoDurationLabel && (
                <span className="absolute right-1.5 bottom-1.5 rounded bg-black/75 px-1 py-0.5 text-[10px] font-medium text-white">
                  {article.videoDurationLabel}
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className="inline-flex items-center gap-1.5 font-bold" style={{ color }}>
              <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
              {categoryName}
            </span>
            {article.isBreaking && (
              <span className="rounded bg-live px-1.5 py-0.5 text-[10px] font-bold text-live-foreground">LIVE</span>
            )}
            <span className="text-text-muted">{formatRelativeTime(article.publishedAt)}</span>
          </div>

          <h3 className="line-clamp-2 text-lg leading-snug font-bold text-text transition-colors group-hover:text-accent sm:text-xl">
            {article.title}
          </h3>
          <p className="line-clamp-2 hidden text-[15px] text-text-muted sm:block">{article.excerpt}</p>
        </div>
      </Link>
    </motion.article>
  );
}
