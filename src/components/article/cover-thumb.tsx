import { SafeImage as Image } from "@/components/ui/safe-image";
import { cn } from "@/lib/cn";
import type { ArticleWithRelations } from "@/types/article";

/** The thumbnail for a story, wherever a story appears.
 *
 *  A story can lead with a photo or with a clip, and a clip has no still of
 *  its own. When the reel is ready its poster frame fills in, but until then
 *  — and for a video story with no reel asked for — there is no image at all,
 *  and every card, rail and hero slide drew an empty grey box.
 *
 *  So: photo if there is one, otherwise the video's own first frame, and only
 *  then nothing. Lives in one place because the gap showed up in six.
 *
 *  Drops into the same `relative` box the cards already have, and takes the
 *  same `fill` behaviour. */
export function CoverThumb({
  article,
  sizes,
  priority,
  className,
}: {
  /** A reel's poster frame already arrives as `coverImageUrl`, so only the
   *  three fields below decide what is drawn. */
  article: Pick<
    ArticleWithRelations,
    "coverImageUrl" | "coverImageAlt" | "coverVideoUrl" | "title"
  >;
  sizes?: string;
  priority?: boolean;
  /** Applied to whichever element is drawn, so a card's hover zoom and
   *  object-fit carry over to a video thumbnail unchanged. */
  className?: string;
}) {
  if (article.coverImageUrl) {
    return (
      <Image
        src={article.coverImageUrl}
        alt={article.coverImageAlt || article.title}
        fill
        priority={priority}
        sizes={sizes}
        className={className}
      />
    );
  }

  if (article.coverVideoUrl) {
    return (
      <video
        // `#t=0.1` asks for a frame a fraction in. Chromium paints the first
        // frame from metadata alone, but Safari shows nothing until the clip
        // is played — and a black rectangle in a card is the bug this
        // component exists to remove.
        src={`${article.coverVideoUrl}#t=0.1`}
        preload="metadata"
        muted
        playsInline
        // Decorative here: the headline next to it already says what this is.
        aria-hidden
        tabIndex={-1}
        className={cn("absolute inset-0 size-full bg-black", className)}
      />
    );
  }

  return <span aria-hidden className="absolute inset-0 bg-surface-muted" />;
}
