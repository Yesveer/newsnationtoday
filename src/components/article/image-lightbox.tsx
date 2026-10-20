"use client";

import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";

/** A photo at full size, over the page.
 *
 *  Shared by the cover and by the photos inside a story, so both behave the
 *  same way: click the backdrop or press Escape to close, and the page behind
 *  does not scroll while it is open. */
export function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Restores whatever was there rather than clearing it, in case something
    // else up the tree had already locked scrolling.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="बंद कीजिए"
        className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <IconX className="size-5" />
      </button>

      {/* Unoptimised on purpose: this is the full-size view, so the point is
          the original file rather than a resized copy. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onClick={(event) => event.stopPropagation()}
        className="max-h-full max-w-full cursor-default object-contain"
      />
    </div>
  );
}
