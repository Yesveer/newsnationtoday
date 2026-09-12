"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Clock, Play } from "lucide-react";
import { formatRelativeTime } from "@/lib/format-date";
import { fadeUp } from "@/lib/motion-variants";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/cn";
import type { ArticleWithRelations } from "@/types/article";

/** Modern grid card — lifts and zooms on hover, category chip in its own colour. */
export function StoryCard({ article, className }: { article: ArticleWithRelations; className?: string }) {
  const { language } = useLanguage();
  const href = `/${article.category.slug}/${article.slug}`;
  const categoryName = language === "en" ? (article.category.nameEn ?? article.category.name) : article.category.name;

  return (
    <motion.article variants={fadeUp} className={cn("group h-full", className)}>
      <Link
        href={href}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45)]"
      >
        <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-surface-muted">
          <Image
            src={article.coverImageUrl}
            alt={article.coverImageAlt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[600ms] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70" />

          <span
            className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-lg"
            style={{ backgroundColor: article.category.color ?? "var(--accent)" }}
          >
            {categoryName}
          </span>

          {article.isBreaking && (
            <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-live px-2.5 py-1 text-[11px] font-bold text-live-foreground shadow-lg">
              <span className="animate-live-pulse size-1.5 rounded-full bg-live-foreground" aria-hidden />
              LIVE
            </span>
          )}

          {article.isVideo && (
            <>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-white/90 text-black shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <Play className="size-5 fill-current" />
                </span>
              </span>
              {article.videoDurationLabel && (
                <span className="absolute right-3 bottom-3 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-medium text-white">
                  {article.videoDurationLabel}
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 text-lg leading-snug font-bold text-text transition-colors group-hover:text-accent">
            {article.title}
          </h3>
          <p className="line-clamp-2 text-[15px] text-text-muted">{article.excerpt}</p>
          <p className="mt-auto flex items-center gap-1.5 pt-1 text-[13px] text-text-muted">
            <Clock className="size-3.5" />
            {formatRelativeTime(article.publishedAt)}
            <span aria-hidden>·</span>
            {article.author.name}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
