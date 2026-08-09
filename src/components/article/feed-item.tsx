import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import { ShareRail } from "@/components/article/share-rail";
import { formatRelativeTime } from "@/lib/format-date";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import type { ArticleWithRelations } from "@/types/article";

function getKicker(article: ArticleWithRelations): { text: string; colorClass: string } | null {
  if (article.isBreaking) return { text: "ब्रेकिंग", colorClass: "text-kicker-red" };
  if (article.isFeatured) return { text: "खास खबर", colorClass: "text-kicker-orange" };
  return null;
}

/** The one dense article-preview shape used sitewide: feed, category listing, related articles. */
export function FeedItem({ article, className }: { article: ArticleWithRelations; className?: string }) {
  const kicker = getKicker(article);
  const href = `/${article.category.slug}/${article.slug}`;
  const url = `${siteConfig.url}${href}`;
  const pillLabel = article.location?.city ?? article.category.name;

  return (
    <article className={cn("flex gap-4 border-b border-border py-5 last:border-b-0", className)}>
      <div className="flex flex-1 flex-col gap-2">
        <Link href={href}>
          <h3 className="text-lg leading-snug font-bold text-text sm:text-xl">
            {kicker && <span className={cn("mr-1.5", kicker.colorClass)}>{kicker.text}:</span>}
            {article.title}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/${article.category.slug}`}
            className="inline-flex items-center gap-0.5 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {pillLabel} <ChevronRight className="size-3" />
          </Link>
          <span className="text-xs text-text-muted">{formatRelativeTime(article.publishedAt)}</span>
        </div>

        <ShareRail url={url} title={article.title} size="sm" />
      </div>

      <Link
        href={href}
        className="group relative aspect-4/3 w-28 shrink-0 overflow-hidden rounded-md bg-surface-muted sm:w-48"
      >
        <Image src={article.coverImageUrl} alt={article.coverImageAlt} fill sizes="200px" className="object-cover" />
        {article.isVideo && (
          <>
            <span className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="flex size-8 items-center justify-center rounded-full bg-white/90 text-black transition-transform group-hover:scale-110">
                <Play className="size-3.5 fill-current" />
              </span>
            </span>
            {article.videoDurationLabel && (
              <span className="absolute right-1 bottom-1 rounded bg-black/75 px-1 py-0.5 text-[10px] font-medium text-white">
                {article.videoDurationLabel}
              </span>
            )}
          </>
        )}
      </Link>
    </article>
  );
}
