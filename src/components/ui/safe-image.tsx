import Image, { type ImageProps } from "next/image";
import { isOptimizableImage } from "@/lib/image-hosts";

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
export function SafeImage({ src, alt, ...props }: ImageProps) {
  const source = typeof src === "string" ? src : "";
  const unoptimized = typeof src === "string" ? !isOptimizableImage(source) : false;

  return <Image src={src} alt={alt} unoptimized={unoptimized} {...props} />;
}
