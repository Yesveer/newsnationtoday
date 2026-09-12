"use client";

import { motion } from "motion/react";
import { StoryCard } from "@/components/article/story-card";
import { staggerContainer, viewportOnce } from "@/lib/motion-variants";
import { useLanguage } from "@/components/i18n/language-provider";
import type { ArticleWithRelations } from "@/types/article";

export function RelatedArticles({ articles }: { articles: ArticleWithRelations[] }) {
  const { t } = useLanguage();
  if (articles.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-6">
      <div className="flex items-center gap-2.5">
        <span className="h-5 w-1.5 rounded-full bg-accent" aria-hidden />
        <h2 className="text-lg font-bold text-text">{t("feed.more")}</h2>
      </div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {articles.map((article) => (
          <StoryCard key={article.id} article={article} />
        ))}
      </motion.div>
    </section>
  );
}
