import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ShareRail } from "@/components/article/share-rail";
import { AuthorByline } from "@/components/article/author-byline";
import { formatRelativeTime } from "@/lib/format-date";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import type { ArticleWithRelations } from "@/types/article";

function getKicker(article: ArticleWithRelations): { text: string; colorClass: string } | null {
  if (article.isBreaking) return { text: "ब्रेकिंग", colorClass: "text-kicker-red" };
  if (article.isFeatured) return { text: "खास खबर", colorClass: "text-kicker-orange" };
  return null;
}

export function ArticleHeader({ article }: { article: ArticleWithRelations }) {
  const kicker = getKicker(article);
  const url = `${siteConfig.url}/${article.category.slug}/${article.slug}`;

  return (
    <header className="flex flex-col gap-3">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-text-muted">
        <Link href="/" className="hover:text-accent">
          होम
        </Link>
        <ChevronRight className="size-3" />
        <Link href={`/${article.category.slug}`} className="hover:text-accent">
          {article.category.name}
        </Link>
      </nav>

      <h1 className="text-[26px] leading-tight font-bold text-text sm:text-4xl">
        {kicker && <span className={cn("mr-2", kicker.colorClass)}>{kicker.text}:</span>}
        {article.title}
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AuthorByline author={article.author} />
          <span className="text-sm text-text-muted">· {formatRelativeTime(article.publishedAt)}</span>
        </div>
        <ShareRail url={url} title={article.title} />
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-muted">
        <Image src={article.coverImageUrl} alt={article.coverImageAlt} fill priority sizes="800px" className="object-cover" />
      </div>
    </header>
  );
}
