/** Hosts whose images Next.js may fetch, resize and cache.
 *
 *  Shared by `next.config.ts` and `<SafeImage>` so the list cannot drift. Add
 *  a host here and both the optimiser and the component start trusting it.
 *
 *  Anything *not* on this list still renders — `<SafeImage>` serves it as-is
 *  instead of through the optimiser. That matters because the story form lets
 *  an editor paste any image URL, and `next/image` throws a hard error on an
 *  unconfigured host, which takes the whole page down with it. */
export const OPTIMIZED_IMAGE_HOSTS = [
  "res.cloudinary.com",
  "picsum.photos",
  "images.unsplash.com",
  "lh3.googleusercontent.com",
  "drive.google.com",
  "img.youtube.com",
  "i.ytimg.com",
  // Extra hosts for a deployment, comma-separated.
  ...(process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean),
];

/** Whether Next.js is allowed to run this URL through the image optimiser. */
export function isOptimizableImage(src: string): boolean {
  if (!src) return false;
  // A path on our own domain is always fine.
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    return OPTIMIZED_IMAGE_HOSTS.includes(url.hostname);
  } catch {
    // data: URLs and anything unparseable — render, do not optimise.
    return false;
  }
}
