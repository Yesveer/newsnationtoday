"use client";

import { useEffect, useState } from "react";
import { IconX, IconZoomIn } from "@tabler/icons-react";
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

  // Escape closes it, and the page behind must not scroll while it is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

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
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="बंद कीजिए"
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <IconX className="size-5" />
          </button>

          {/* Unoptimised on purpose: this is the full-size view, so the
              point is the original file rather than a resized copy. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(event) => event.stopPropagation()}
            className="max-h-full max-w-full cursor-default object-contain"
          />
        </div>
      ) : null}
    </>
  );
}
