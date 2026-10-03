"use client";

import { useEffect, useSyncExternalStore } from "react";
import { SafeImage as Image } from "@/components/ui/safe-image";
import Link from "next/link";
import { motion } from "motion/react";
import { siteConfig } from "@/config/site";
import { useSiteSettings } from "@/components/site/site-settings-provider";
import { cn } from "@/lib/cn";

const SESSION_KEY = "newshub-logo-drawn";
// Intrinsic size of public/logo-nnt.png (tight-cropped from the client's supplied artwork).
const LOGO_ASPECT = 900 / 301;

const maskStyle = {
  maskImage: "url(/logo-nnt.png)",
  WebkitMaskImage: "url(/logo-nnt.png)",
  maskSize: "contain",
  WebkitMaskSize: "contain",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskPosition: "center",
} as const;

function getShouldAnimate(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return sessionStorage.getItem(SESSION_KEY) !== "1";
}

const emptySubscribe = () => () => {};
const getServerSnapshot = () => false;

/**
 * Renders the client's supplied logo mark with:
 * - a one-time entrance animation per browser session (sessionStorage-gated,
 *   like StoneOks' site-loader) that never replays mid-session, and
 * - a continuously-looping "live" shine sweep clipped to the logo's own
 *   alpha shape via a CSS mask, so the brand mark never sits fully static.
 * Both respect `prefers-reduced-motion` (the entrance via `shouldAnimate`,
 * the loop via the global reduced-motion override in globals.css).
 * Shared with the future admin topbar (Phase 2).
 */
export function AnimatedLogo({ size, className }: { size?: number; className?: string }) {
  const { brand } = useSiteSettings();
  const animateSession = useSyncExternalStore(emptySubscribe, getShouldAnimate, getServerSnapshot);
  // The logo file, its size, the name under it and the shine are all set in
  // the Appearance screen.
  const shouldAnimate = animateSession && brand.animateLogo;

  useEffect(() => {
    if (shouldAnimate) sessionStorage.setItem(SESSION_KEY, "1");
  }, [shouldAnimate]);

  const height = size ?? brand.logoSize;
  const width = Math.round(height * LOGO_ASPECT);

  return (
    <Link
      href="/"
      className={cn("flex shrink-0 flex-col items-center gap-0.5 leading-none", className)}
      aria-label={siteConfig.name}
    >
      <motion.span
        className="relative block"
        style={{ width, height }}
        initial={shouldAnimate ? { opacity: 0, scale: 0.85, y: 6 } : false}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Image src={brand.logoUrl} alt={brand.siteName || siteConfig.name} width={width} height={height} priority className="object-contain" />
        {brand.animateLogo ? (
          <span aria-hidden className="animate-logo-shine pointer-events-none absolute inset-0 opacity-50" style={maskStyle} />
        ) : null}
      </motion.span>
      {brand.showNameUnderLogo ? (
        // `notranslate` keeps Google's translator from mangling the brand name.
        <span
          className="notranslate font-display text-[12px] leading-none font-extrabold tracking-[0.06em] whitespace-nowrap text-text uppercase sm:text-[15px] sm:tracking-[0.1em]"
          translate="no"
        >
          {brand.siteName || siteConfig.name}
        </span>
      ) : null}
    </Link>
  );
}
