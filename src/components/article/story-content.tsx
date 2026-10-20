"use client";

import { useState } from "react";
import { ImageLightbox } from "@/components/article/image-lightbox";

/** The story's HTML, with its photos openable full screen.
 *
 *  The sanitising happens on the server — `sanitize-html` has no business in
 *  a browser bundle — so this takes already-clean HTML and does one thing:
 *  listens for clicks on the photos inside it.
 *
 *  One delegated listener rather than a React node per image, because the
 *  body arrives as a string of HTML. Attaching per-image handlers would mean
 *  parsing it into components and rebuilding what the reporter laid out. */
export function StoryContent({ html }: { html: string }) {
  const [open, setOpen] = useState<{ src: string; alt: string } | null>(null);

  return (
    <>
      <div
        // The cursor is set here rather than in the stylesheet so it only
        // applies where the click actually does something.
        className="news-prose [&_img]:cursor-zoom-in"
        onClick={(event) => {
          const target = event.target as HTMLElement;
          if (target.tagName !== "IMG") return;
          // A photo inside a link belongs to the link; opening it instead
          // would swallow a tap the reporter meant to go somewhere.
          if (target.closest("a")) return;
          const image = target as HTMLImageElement;
          // `currentSrc` is the file the browser actually chose, which is
          // what the reader is looking at.
          setOpen({ src: image.currentSrc || image.src, alt: image.alt });
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {open ? (
        <ImageLightbox src={open.src} alt={open.alt} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}
