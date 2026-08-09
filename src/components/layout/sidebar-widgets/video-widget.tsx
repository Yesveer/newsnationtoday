import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { getAllArticles } from "@/lib/data/get-articles";

export async function VideoWidget() {
  const video = (await getAllArticles()).find((article) => article.isVideo);
  if (!video) return null;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-text">वीडियो</h2>
        <Link href={`/${video.category.slug}`} className="text-xs font-medium text-accent hover:underline">
          और देखें
        </Link>
      </div>
      <Link href={`/${video.category.slug}/${video.slug}`} className="group relative block aspect-video overflow-hidden rounded-md bg-surface-muted">
        <Image src={video.coverImageUrl} alt={video.coverImageAlt} fill sizes="300px" className="object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
          <span className="flex size-10 items-center justify-center rounded-full bg-white/90 text-black transition-transform group-hover:scale-110">
            <Play className="size-4 fill-current" />
          </span>
        </span>
        {video.videoDurationLabel && (
          <span className="absolute right-1.5 bottom-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {video.videoDurationLabel}
          </span>
        )}
      </Link>
      <p className="mt-2 text-sm leading-snug font-medium text-text">{video.title}</p>
    </div>
  );
}
