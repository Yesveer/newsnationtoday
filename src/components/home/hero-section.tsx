"use client";

import { useEffect, useState } from "react";
import { CoverThumb } from "@/components/article/cover-thumb";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { TimeAgo } from "@/components/article/time-ago";
import { useLanguage } from "@/components/i18n/language-provider";
import { useSiteSettings } from "@/components/site/site-settings-provider";
import { cn } from "@/lib/cn";
import type { ArticleWithRelations } from "@/types/article";


/** Homepage-only lead block: an auto-rotating headline slider plus a top-stories rail. */
export function HeroSection({ articles }: { articles: ArticleWithRelations[] }) {
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  // Slide speed, the zoom and the LIVE badge are Appearance settings.
  const { hero } = useSiteSettings();
  const slideMs = Math.max(2, hero.autoplaySeconds) * 1000;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = articles.slice(0, 3);
  const sideStories = articles.slice(3, 7);

  useEffect(() => {
    if (paused || reduceMotion || slides.length <= 1) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % slides.length), slideMs);
    return () => clearInterval(timer);
  }, [paused, reduceMotion, slides.length, slideMs]);

  if (pathname !== "/" || slides.length === 0) return null;

  const active = slides[index] ?? slides[0];
  const categoryName = language === "en" ? (active.category.nameEn ?? active.category.name) : active.category.name;

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-[1440px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-xl bg-surface-muted lg:self-start"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div className="relative aspect-[16/10] w-full sm:aspect-video lg:aspect-[2.1/1]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <CoverThumb
                  article={active}
                  priority
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  className={cn("object-cover", !reduceMotion && hero.kenBurns && "animate-kenburns")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </motion.div>
            </AnimatePresence>

            <div className="pointer-events-none absolute top-3 left-3 z-20 flex items-center gap-2 sm:top-4 sm:left-4">
              <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
                {categoryName}
              </span>
              {active.isBreaking && hero.showLiveBadge && (
                <span className="flex items-center gap-1.5 rounded-full bg-live px-2.5 py-1 text-[11px] font-bold text-live-foreground">
                  <span className="animate-live-pulse size-1.5 rounded-full bg-live-foreground" aria-hidden />
                  {t("label.live")}
                </span>
              )}
            </div>

            {/* The whole slide is the link, not just the headline. It sits
                over the image and under the text, and the text lets clicks
                through — so a reader can tap the picture, the summary or the
                byline and still land on the story. The dots switch pointer
                events back on, or changing slide would open one instead. */}
            <Link
              href={`/${active.category.slug}/${active.slug}`}
              aria-label={active.title}
              className="absolute inset-0 z-10"
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6">
              <h2 className="line-clamp-3 text-lg leading-snug font-bold text-white sm:text-2xl lg:text-3xl">
                {active.title}
              </h2>
              <p className="mt-2 hidden text-sm text-white/80 sm:line-clamp-2">{active.excerpt}</p>
              <p className="mt-2 text-xs text-white/70">
                {active.author.name} · <TimeAgo iso={active.publishedAt} />
              </p>

              {slides.length > 1 && (
                <div className="pointer-events-auto mt-3 flex w-fit items-center gap-1.5">
                  {slides.map((slide, slideIndex) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setIndex(slideIndex)}
                      aria-label={`${t("hero.slide")} ${slideIndex + 1}`}
                      aria-current={slideIndex === index}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        slideIndex === index ? "w-7 bg-accent" : "w-2.5 bg-white/50 hover:bg-white/80",
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {sideStories.length > 0 && (
          <div className="flex flex-col overflow-hidden rounded-xl border border-border">
            <h2 className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm font-bold text-text">
              <span className="h-4 w-1 rounded-full bg-live" aria-hidden />
              {t("hero.topStories")}
            </h2>
            <div className="flex flex-col divide-y divide-border">
              {sideStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/${story.category.slug}/${story.slug}`}
                  className="group flex gap-3 p-3 transition-colors hover:bg-surface-muted"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-surface-muted sm:size-20">
                    <CoverThumb
                      article={story}
                      sizes="80px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-text transition-colors group-hover:text-accent">
                      {story.title}
                    </h3>
                    <p className="mt-1 text-xs text-text-muted">
                      <TimeAgo iso={story.publishedAt} />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
