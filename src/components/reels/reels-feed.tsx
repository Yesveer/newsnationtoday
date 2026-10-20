"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  IconChevronDown,
  IconPlayerPlayFilled,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { ShareButton } from "@/components/share/share-button";
import type { ArticleWithRelations } from "@/types/article";

/** One reel: the vertical clip, and the story as text beside or under it.
 *
 *  No photographs anywhere in here — the brief was Instagram reels and
 *  YouTube Shorts, where the video is the whole picture and the words sit on
 *  top of it. The story arrives as HTML; it is stripped to text rather than
 *  rendered, so an image inside the body cannot sneak back in. */
function reelText(bodyHtml: string): string {
  return bodyHtml
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function Reel({
  article,
  active,
  muted,
  onToggleMute,
}: {
  article: ArticleWithRelations;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);

  // Only the reel in view plays. Everything else is paused and rewound, so
  // scrolling back does not drop the reader into the middle of a clip, and a
  // phone is not decoding six videos at once.
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (active) {
      const attempt = element.play();
      // Autoplay is refused when the clip is not muted; that is the browser
      // working as intended, and the reader can start it by tapping.
      if (attempt) attempt.then(() => setPaused(false)).catch(() => setPaused(true));
    } else {
      element.pause();
      element.currentTime = 0;
    }
  }, [active]);

  const togglePlay = () => {
    const element = video.current;
    if (!element) return;
    if (element.paused) {
      void element.play();
      setPaused(false);
    } else {
      element.pause();
      setPaused(true);
    }
  };

  const text = reelText(article.bodyHtml ?? "");

  return (
    <section
      data-reel
      className="relative flex h-full w-full shrink-0 snap-start snap-always items-center justify-center bg-black"
    >
      {/* The 9:16 frame. Capped by height so the clip is never cropped and
          never overflows, whatever the window is. */}
      <div className="relative flex h-full w-full max-w-[calc((100svh-7rem)*9/16)] items-center justify-center">
        <video
          ref={video}
          src={article.reel?.videoUrl}
          poster={article.reel?.posterUrl}
          muted={muted}
          loop
          playsInline
          preload={active ? "auto" : "none"}
          onClick={togglePlay}
          className="h-full w-full object-contain"
        />

        {paused ? (
          <button
            type="button"
            onClick={togglePlay}
            aria-label="चलाइए"
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="rounded-full bg-black/50 p-5 backdrop-blur-sm">
              <IconPlayerPlayFilled className="size-8 text-white" />
            </span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "आवाज़ चालू करें" : "आवाज़ बंद करें"}
          className="absolute top-4 right-4 rounded-full bg-black/50 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          {muted ? <IconVolumeOff className="size-5" /> : <IconVolume className="size-5" />}
        </button>

        {/* Down the right edge, above the caption — where a thumb already
            is on a phone, and where both Reels and Shorts put it. */}
        <div className="absolute right-4 bottom-32 z-10">
          <ShareButton
            variant="overlay"
            title={article.title}
            path={`/${article.category.slug}/${article.slug}`}
          />
        </div>

        {/* The gradient is what keeps the text legible over a bright frame. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 pb-8 text-white">
          <Link
            href={`/${article.category.slug}/${article.slug}`}
            className="w-fit rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            {article.category.name}
          </Link>

          <h2 className="font-display text-lg leading-snug font-bold text-balance">
            {article.title}
          </h2>

          <div
            className={cn(
              "text-[13px] leading-relaxed whitespace-pre-line text-white/85",
              expanded ? "max-h-[38svh] overflow-y-auto pr-1" : "line-clamp-3",
            )}
          >
            {text || article.excerpt}
          </div>

          {text.length > 160 ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="w-fit text-[12px] font-semibold text-white/70 underline-offset-2 hover:underline"
            >
              {expanded ? "कम दिखाइए" : "पूरी खबर पढ़िए"}
            </button>
          ) : null}

          <p className="text-[11px] text-white/60">{article.author?.name}</p>
        </div>
      </div>
    </section>
  );
}

export function ReelsFeed({ articles }: { articles: ArticleWithRelations[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Muted to begin with, because a feed that starts shouting is a feed the
  // reader closes — and because no browser autoplays an unmuted video.
  const [muted, setMuted] = useState(true);

  // An observer rather than a scroll handler: it reports which reel actually
  // occupies the viewport, and does not fire on every pixel of a flick.
  const observe = useCallback((node: HTMLDivElement | null) => {
    container.current = node;
  }, []);

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const reels = Array.from(node.querySelectorAll<HTMLElement>("[data-reel]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveIndex(reels.indexOf(entry.target as HTMLElement));
          }
        }
      },
      { root: node, threshold: 0.6 },
    );
    reels.forEach((reel) => observer.observe(reel));
    return () => observer.disconnect();
  }, [articles.length]);

  return (
    // Sized to the viewport minus the masthead rather than the whole screen:
    // the feed scrolls inside itself, and the page behind it does not scroll
    // along with it. `overscroll-contain` is what stops a flick at the end of
    // the feed from dragging the page.
    <div
      ref={observe}
      className="h-[calc(100svh-7rem)] min-h-[480px] w-full snap-y snap-mandatory overflow-y-scroll overscroll-contain rounded-xl bg-black"
    >
      {articles.map((article, index) => (
        <Reel
          key={article.id}
          article={article}
          active={index === activeIndex}
          muted={muted}
          onToggleMute={() => setMuted((value) => !value)}
        />
      ))}

      {activeIndex === 0 && articles.length > 1 ? (
        <div className="pointer-events-none sticky bottom-6 flex animate-bounce justify-center text-white/60">
          <IconChevronDown className="size-6" />
        </div>
      ) : null}
    </div>
  );
}
