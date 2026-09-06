import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import { ShareRail } from "@/components/article/share-rail";
import { formatRelativeTime } from "@/lib/format-date";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import type { ArticleWithRelations } from "@/types/article";

function Kicker({ article }: { article: ArticleWithRelations }) {
  if (article.isBreaking) {
    return (
      <span className="mr-2 inline-flex items-center rounded bg-live px-1.5 py-0.5 align-middle text-[11px] font-bold tracking-wide text-live-foreground">
        LIVE
      </span>
    );
  }
  if (article.isFeatured) {
    return <span className="mr-1.5 text-kicker-orange">खास खबर:</span>;
  }
  return null;
}

function VideoOverlay({ article, big = false }: { article: ArticleWithRelations; big?: boolean }) {
  if (!article.isVideo) return null;

  return (
    <>
      <span className="absolute inset-0 flex items-center justify-center bg-black/20">
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-white/90 text-black transition-transform duration-300 group-hover:scale-110",
            big ? "size-14" : "size-8",
          )}
        >
          <Play className={cn("fill-current", big ? "size-6" : "size-3.5")} />
        </span>
      </span>
      {article.videoDurationLabel && (
        <span className="absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {article.videoDurationLabel}
        </span>
      )}
    </>
  );
}

function MetaRow({ article, url }: { article: ArticleWithRelations; url: string }) {
  const pillLabel = article.location?.city ?? article.category.name;

  return (
    <div className="mt-3 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href={`/${article.category.slug}`}
          className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
        >
          {pillLabel} <ChevronRight className="size-3" />
        </Link>
        <span className="truncate text-xs text-text-muted">{formatRelativeTime(article.publishedAt)}</span>
      </div>
      <ShareRail url={url} title={article.title} size="sm" className="shrink-0" />
    </div>
  );
}

/**
 * Two shapes, same data: `lead` gets the full-width image treatment used for
 * the top story of a block, `compact` is the dense list row.
 */
export function FeedItem({
  article,
  variant = "compact",
  className,
}: {
  article: ArticleWithRelations;
  variant?: "lead" | "compact";
  className?: string;
}) {
  const href = `/${article.category.slug}/${article.slug}`;
  const url = `${siteConfig.url}${href}`;

  if (variant === "lead") {
    return (
      <article className={cn("border-b border-border py-5 last:border-b-0", className)}>
        <Link href={href}>
          <h3 className="text-xl leading-snug font-bold text-text sm:text-2xl">
            <Kicker article={article} />
            {article.title}
          </h3>
        </Link>

        <Link
          href={href}
          className="group relative mt-3 block aspect-video w-full overflow-hidden rounded-lg bg-surface-muted"
        >
          <Image
            src={article.coverImageUrl}
            alt={article.coverImageAlt}
            fill
            sizes="(min-width: 1024px) 62vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <VideoOverlay article={article} big />
        </Link>

        <MetaRow article={article} url={url} />
      </article>
    );
  }

  return (
    <article className={cn("flex gap-4 border-b border-border py-5 last:border-b-0", className)}>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={href}>
          <h3 className="text-lg leading-snug font-bold text-text sm:text-xl">
            <Kicker article={article} />
            {article.title}
          </h3>
        </Link>
        <MetaRow article={article} url={url} />
      </div>

      <Link
        href={href}
        className="group relative aspect-4/3 w-28 shrink-0 self-start overflow-hidden rounded-lg bg-surface-muted sm:w-44"
      >
        <Image
          src={article.coverImageUrl}
          alt={article.coverImageAlt}
          fill
          sizes="200px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <VideoOverlay article={article} />
      </Link>
    </article>
  );
}
