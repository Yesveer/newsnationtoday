"use client";

import { useState } from "react";
import { IconZoomIn } from "@tabler/icons-react";
import { ImageLightbox } from "@/components/article/image-lightbox";
import { SafeImage as Image } from "@/components/ui/safe-image";

/** The story's cover photo, shown whole, and openable full screen.
 *
 *  Whole, because a news photo is composed: cropping it to a 16:9 box cuts
 *  the edges off a portrait shot or a wide crowd scene, and the edges are
 *  often the story. `object-contain` inside a bounded box shows all of it
 *  whatever shape it is.
 *
 *  Full screen, because a reader who wants to look closer at a photo has
 *  nowhere else to go — the alternative is opening the image URL by hand. */
export function CoverViewer({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="फोटो बड़ा करके देखिए"
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-lg bg-surface-muted"
      >
        <Image
          src={src}
          alt={alt}
          width={1600}
          height={900}
          priority
          sizes="(min-width: 1024px) 800px, 100vw"
          // Intrinsic width and height are only there to give the optimiser a
          // ratio to work with; the real shape comes from the file, and the
          // cap stops a tall photo pushing the story off the screen.
          className="h-auto max-h-[70svh] w-full object-contain"
        />
        <span className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <IconZoomIn className="size-4" />
        </span>
      </button>

      {open ? (
        <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
