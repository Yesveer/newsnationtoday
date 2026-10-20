"use client";

import { useEffect, useState } from "react";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandX,
  IconCheck,
  IconCopy,
  IconShare3,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";

/** Share a story, from the article page or from a reel.
 *
 *  On a phone the first stop is the operating system's own share sheet —
 *  that is the only route to Instagram, and it also reaches whatever else
 *  the reader actually has installed rather than the handful of networks we
 *  guessed at. The explicit list below is the fallback for desktop, where no
 *  such sheet exists.
 *
 *  `variant` only changes the trigger. Both surfaces open the same sheet, so
 *  a reader who learns to share from one already knows the other. */
export function ShareButton({
  title,
  path,
  variant = "inline",
  className,
}: {
  title: string;
  /** The story's path, e.g. `/desh/some-slug`. */
  path: string;
  /** "overlay" is the round glass button that sits on a reel; "inline" is
   *  the labelled button that sits under a headline. */
  variant?: "overlay" | "inline";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // `window.location` rather than a configured host, so a link copied from
  // staging or a phone on the LAN points back at the site it was copied from.
  const url =
    typeof window === "undefined"
      ? `${siteConfig.url}${path}`
      : `${window.location.origin}${path}`;

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard access is refused on an insecure origin and in some
      // in-app browsers; a prompt is a worse experience than no feedback,
      // so the button simply does not confirm.
      setCopied(false);
    }
  }

  async function share() {
    // Checked here rather than held in state: `navigator.share` does not
    // exist during the server render, and reading it at render time would
    // make the markup differ on hydration.
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // The reader dismissed the sheet, or it refused. Fall through to
        // our own list rather than leaving the tap doing nothing.
      }
    }
    setOpen(true);
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: IconBrandWhatsapp,
      tint: "bg-[#25D366]",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: IconBrandFacebook,
      tint: "bg-[#1877F2]",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: IconBrandX,
      tint: "bg-black",
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: IconBrandTelegram,
      tint: "bg-[#229ED9]",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: IconBrandLinkedin,
      tint: "bg-[#0A66C2]",
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={share}
        aria-label="शेयर कीजिए"
        className={cn(
          "flex items-center justify-center transition-colors",
          variant === "overlay"
            ? "size-11 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
            : "gap-1.5 rounded-full border border-border px-3 py-1.5 text-[13px] font-medium text-text-muted hover:border-accent hover:text-accent",
          className,
        )}
      >
        <IconShare3 className={variant === "overlay" ? "size-5" : "size-4"} />
        {variant === "inline" ? <span>शेयर</span> : null}
      </button>

      {open ? (
        <div
          className={cn(
            "z-50 flex items-end justify-center bg-black/60",
            // On a reel the sheet belongs to the reel's own frame; anywhere
            // else there is no such frame to sit inside, so it is pinned to
            // the viewport.
            variant === "overlay" ? "absolute inset-0" : "fixed inset-0",
          )}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[460px] rounded-t-2xl bg-surface p-4 pb-6 text-text sm:mb-8 sm:rounded-2xl"
            // The sheet sits on top of the video; a tap inside it must not
            // reach the backdrop and close it.
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold">शेयर कीजिए</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="बंद कीजिए"
                className="rounded-full p-1 text-text-muted hover:text-text"
              >
                <IconX className="size-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {targets.map(({ label, href, icon: Icon, tint }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex w-[64px] flex-col items-center gap-1.5"
                >
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full text-white transition-transform hover:scale-105",
                      tint,
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="text-[11px] text-text-muted">{label}</span>
                </a>
              ))}

              {/* Instagram takes no link from a web page — there is no share
                  URL for it. Copying is what actually works: the reader
                  pastes it into a story or a DM. Saying so is better than a
                  button that quietly fails. */}
              <button
                type="button"
                onClick={copyLink}
                className="flex w-[64px] flex-col items-center gap-1.5"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white transition-transform hover:scale-105">
                  <IconBrandInstagram className="size-5" />
                </span>
                <span className="text-[11px] text-text-muted">
                  {copied ? "कॉपी हुआ" : "Instagram"}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={copyLink}
              className="mt-4 flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-left text-[13px] transition-colors hover:border-accent"
            >
              {copied ? (
                <IconCheck className="size-4 shrink-0 text-accent" />
              ) : (
                <IconCopy className="size-4 shrink-0 text-text-muted" />
              )}
              <span className="min-w-0 flex-1 truncate text-text-muted">{url}</span>
              <span className="shrink-0 font-semibold text-accent">
                {copied ? "कॉपी हुआ" : "कॉपी"}
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
