"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Search, X } from "lucide-react";
import { NewsFeed } from "@/components/home/news-feed";
import { useLanguage } from "@/components/i18n/language-provider";
import { staggerContainer, fadeUp, viewportOnce } from "@/lib/motion-variants";
import type { Topic } from "@/config/topics.config";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { stateMapPaths } from "@/config/state-maps";
import { topicIcons } from "@/components/topics/topic-icon";
import type { ArticleWithRelations } from "@/types/article";
import { cn } from "@/lib/cn";

/**
 * One flat visual language: states show their real map outline, countries show
 * their flag, and everything else shows a stroked vector icon in the topic's
 * colour. No tile backgrounds anywhere.
 */
function Badge({ topic, size = "md" }: { topic: Topic; size?: "sm" | "md" }) {
  const box = size === "md" ? "size-11" : "size-8";
  const mapPath = stateMapPaths[topic.slug];

  if (mapPath) {
    return (
      <svg viewBox="0 0 100 100" className={cn(box, "shrink-0")} role="img" aria-label={topic.nameEn}>
        <path d={mapPath} fill={topic.color} />
      </svg>
    );
  }

  const Icon = topicIcons[topic.slug];
  if (Icon) {
    return (
      <span className={cn(box, "flex shrink-0 items-center justify-center")} style={{ color: topic.color }}>
        <Icon className={size === "md" ? "size-9" : "size-6"} stroke={1.6} />
      </span>
    );
  }

  // Countries keep their flag glyph.
  return (
    <span
      className={cn(
        box,
        "flex shrink-0 items-center justify-center leading-none",
        size === "md" ? "text-3xl" : "text-xl",
      )}
    >
      {topic.badge}
    </span>
  );
}

/**
 * Category hub: pick a sub-topic (state / country / sport) from a searchable
 * grid, then browse just that topic's stories — with a dropdown to switch
 * without going back.
 */
export function TopicExplorer({
  articles,
  topics,
  searchKey,
}: {
  articles: ArticleWithRelations[];
  topics: Topic[];
  searchKey: TranslationKey;
}) {
  const { language, t } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const [gridQuery, setGridQuery] = useState("");
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [switcherQuery, setSwitcherQuery] = useState("");
  const switcherRef = useRef<HTMLDivElement>(null);

  const label = (topic: Topic) => (language === "en" ? topic.nameEn : topic.name);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const article of articles) {
      if (article.topic) map.set(article.topic, (map.get(article.topic) ?? 0) + 1);
    }
    return map;
  }, [articles]);

  const matches = (topic: Topic, query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      topic.name.toLowerCase().includes(q) ||
      topic.nameEn.toLowerCase().includes(q) ||
      topic.badge.toLowerCase().includes(q)
    );
  };

  const gridTopics = topics.filter((topic) => matches(topic, gridQuery));
  const switcherTopics = topics.filter((topic) => matches(topic, switcherQuery));
  const selectedTopic = topics.find((topic) => topic.slug === selected) ?? null;
  const visibleArticles = selected ? articles.filter((article) => article.topic === selected) : articles;

  useEffect(() => {
    if (!switcherOpen) return;
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!switcherRef.current?.contains(event.target as Node)) setSwitcherOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSwitcherOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [switcherOpen]);

  function choose(slug: string) {
    setSelected(slug);
    setSwitcherOpen(false);
    setSwitcherQuery("");
  }

  return (
    <div className="flex flex-col gap-5">
      {selectedTopic ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3">
          <div className="flex items-center gap-3">
            <Badge topic={selectedTopic} size="sm" />
            <div>
              <p className="font-bold text-text">{label(selectedTopic)}</p>
              <p className="text-xs text-text-muted">
                {counts.get(selectedTopic.slug) ?? 0} {t("topic.stories")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div ref={switcherRef} className="relative">
              <button
                type="button"
                onClick={() => setSwitcherOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={switcherOpen}
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-text transition-colors hover:border-accent hover:text-accent"
              >
                {t("topic.change")}
                <ChevronDown className="size-3.5" />
              </button>

              <AnimatePresence>
                {switcherOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-border bg-surface p-2 shadow-xl"
                  >
                    <div className="relative mb-1.5">
                      <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
                      <input
                        type="search"
                        value={switcherQuery}
                        onChange={(event) => setSwitcherQuery(event.target.value)}
                        placeholder={t(searchKey)}
                        autoFocus
                        className="w-full rounded-lg border border-border bg-bg py-2 pr-2 pl-8 text-sm text-text outline-none focus-visible:border-accent"
                      />
                    </div>
                    <ul role="listbox" className="max-h-64 overflow-y-auto">
                      {switcherTopics.map((topic) => (
                        <li key={topic.slug}>
                          <button
                            type="button"
                            onClick={() => choose(topic.slug)}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-muted",
                              topic.slug === selected ? "font-bold text-accent" : "text-text",
                            )}
                          >
                            <Badge topic={topic} size="sm" />
                            <span className="truncate">{label(topic)}</span>
                            <span className="ml-auto text-xs text-text-muted">{counts.get(topic.slug) ?? 0}</span>
                          </button>
                        </li>
                      ))}
                      {switcherTopics.length === 0 && (
                        <li className="px-2 py-3 text-center text-sm text-text-muted">{t("topic.noMatch")}</li>
                      )}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <X className="size-3.5" />
              {t("topic.all")}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={gridQuery}
              onChange={(event) => setGridQuery(event.target.value)}
              placeholder={t(searchKey)}
              className="w-full rounded-full border border-border bg-surface py-2.5 pr-4 pl-10 text-sm text-text outline-none focus-visible:border-accent"
            />
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer}
            className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
            {gridTopics.map((topic) => (
              <motion.button
                key={topic.slug}
                variants={fadeUp}
                type="button"
                onClick={() => choose(topic.slug)}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-3 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_14px_30px_-14px_rgb(0_0_0/0.4)]"
              >
                <span className="transition-transform duration-300 group-hover:scale-110">
                  <Badge topic={topic} />
                </span>
                <span className="text-center text-xs leading-tight font-semibold text-text">{label(topic)}</span>
                <span className="text-[11px] text-text-muted">
                  {counts.get(topic.slug) ?? 0} {t("topic.stories")}
                </span>
              </motion.button>
            ))}
          </motion.div>

          {gridTopics.length === 0 && <p className="text-sm text-text-muted">{t("topic.noMatch")}</p>}
        </div>
      )}

      {visibleArticles.length > 0 ? (
        <NewsFeed articles={visibleArticles} />
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-text-muted">
          {t("topic.noNews")}
        </p>
      )}
    </div>
  );
}
