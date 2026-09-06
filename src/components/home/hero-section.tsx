"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { formatRelativeTime } from "@/lib/format-date";
import { useLanguage } from "@/components/i18n/language-provider";
import { cn } from "@/lib/cn";
import type { ArticleWithRelations } from "@/types/article";

const SLIDE_MS = 5000;

/** Homepage-only lead block: an auto-rotating headline slider plus a top-stories rail. */
export function HeroSection({ articles }: { articles: ArticleWithRelations[] }) {
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = articles.slice(0, 3);
  const sideStories = articles.slice(3, 7);

  useEffect(() => {
    if (paused || reduceMotion || slides.length <= 1) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, [paused, reduceMotion, slides.length]);

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
                <Image
                  src={active.coverImageUrl}
                  alt={active.coverImageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  className={cn("object-cover", !reduceMotion && "animate-kenburns")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </motion.div>
            </AnimatePresence>

            <div className="absolute top-3 left-3 flex items-center gap-2 sm:top-4 sm:left-4">
              <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
                {categoryName}
              </span>
              {active.isBreaking && (
                <span className="flex items-center gap-1.5 rounded-full bg-live px-2.5 py-1 text-[11px] font-bold text-live-foreground">
                  <span className="animate-live-pulse size-1.5 rounded-full bg-live-foreground" aria-hidden />
                  {t("label.live")}
                </span>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
              <Link href={`/${active.category.slug}/${active.slug}`} className="block">
                <h2 className="line-clamp-3 text-lg leading-snug font-bold text-white sm:text-2xl lg:text-3xl">
                  {active.title}
                </h2>
              </Link>
              <p className="mt-2 hidden text-sm text-white/80 sm:line-clamp-2">{active.excerpt}</p>
              <p className="mt-2 text-xs text-white/70">
                {active.author.name} · {formatRelativeTime(active.publishedAt)}
              </p>

              {slides.length > 1 && (
                <div className="mt-3 flex items-center gap-1.5">
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
                    <Image
                      src={story.coverImageUrl}
                      alt={story.coverImageAlt}
                      fill
                      sizes="80px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-text transition-colors group-hover:text-accent">
                      {story.title}
                    </h3>
                    <p className="mt-1 text-xs text-text-muted">{formatRelativeTime(story.publishedAt)}</p>
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
