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
  // Cloudflare R2's built-in public domain. A custom domain of your own goes
  // in NEXT_PUBLIC_IMAGE_HOSTS below.
  "**.r2.dev",
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

/** Matches a host against one entry, which may be a `**.example.com` wildcard
 *  of the kind `next.config.ts` accepts. */
function hostMatches(host: string, pattern: string): boolean {
  if (pattern.startsWith("**.")) {
    const suffix = pattern.slice(2); // keeps the leading dot
    return host.endsWith(suffix);
  }
  return host === pattern;
}

/** Whether Next.js is allowed to run this URL through the image optimiser. */
export function isOptimizableImage(src: string): boolean {
  if (!src) return false;
  // A path on our own domain is always fine.
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    return OPTIMIZED_IMAGE_HOSTS.some((pattern) => hostMatches(url.hostname, pattern));
  } catch {
    // data: URLs and anything unparseable — render, do not optimise.
    return false;
  }
}
