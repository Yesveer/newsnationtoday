import Image, { type ImageProps } from "next/image";
import { isOptimizableImage } from "@/lib/image-hosts";
import { cn } from "@/lib/cn";

/** `next/image` that cannot take the page down.
 *
 *  Covers and logos come from the newsroom database: a Cloudinary upload, a
 *  URL an editor pasted from somewhere else, or a small inline data URL from
 *  before storage was configured. Plain `next/image` throws for any host that
 *  is not in `next.config.ts`, and that error is not catchable in a server
 *  component — one pasted link and the article page 500s.
 *
 *  So: known host → optimised as usual. Anything else → served as-is, which
 *  costs a resize but always renders. */
export function SafeImage({ src, alt, className, fill, ...props }: ImageProps) {
  const source = typeof src === "string" ? src : "";

  // An empty src is not a broken image, it is a story with no picture: one
  // that leads with a clip whose reel has not been cut yet, so there is no
  // poster frame to borrow. `next/image` treats "" as a programming error
  // and throws, which would take the whole feed down over a missing
  // thumbnail — a neutral block is the honest thing to draw instead.
  if (typeof src === "string" && source.trim() === "") {
    return (
      <span
        aria-hidden
        className={cn("block bg-surface-muted", fill && "absolute inset-0", className)}
      />
    );
  }

  const unoptimized = typeof src === "string" ? !isOptimizableImage(source) : false;

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      unoptimized={unoptimized}
      {...props}
    />
  );
}
