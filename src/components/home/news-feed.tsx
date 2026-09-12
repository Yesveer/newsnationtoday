"use client";

import { motion } from "motion/react";
import { StoryCard } from "@/components/article/story-card";
import { StoryRow } from "@/components/article/story-row";
import { PromoBanner } from "@/components/home/promo-banner";
import { SectionHeader } from "@/components/home/section-header";
import { staggerContainer, viewportOnce } from "@/lib/motion-variants";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import type { ArticleWithRelations } from "@/types/article";

const GRID_COUNT = 6;

/**
 * Feed rhythm: a card grid up top, then a dense list — so the page doesn't read
 * as one long monotonous column. Both groups reveal with a stagger on scroll.
 */
export function NewsFeed({
  articles,
  headingKey = "feed.latest",
}: {
  articles: ArticleWithRelations[];
  headingKey?: TranslationKey;
}) {
  const gridArticles = articles.slice(0, GRID_COUNT);
  const listArticles = articles.slice(GRID_COUNT);

  return (
    <div className="flex flex-col gap-6">
      {gridArticles.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader labelKey={headingKey} live />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {gridArticles.map((article) => (
              <StoryCard key={article.id} article={article} />
            ))}
          </motion.div>
        </section>
      )}

      {listArticles.length > 0 && (
        <>
          <PromoBanner />

          <section className="flex flex-col gap-3">
            <SectionHeader labelKey="feed.more" />
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={staggerContainer}
              className="flex flex-col divide-y divide-border"
            >
              {listArticles.map((article) => (
                <StoryRow key={article.id} article={article} className="py-1.5 first:pt-0 last:pb-0" />
              ))}
            </motion.div>
          </section>
        </>
      )}
    </div>
  );
}
