"use client";

import { useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const SESSION_KEY = "newshub-logo-drawn";
// Intrinsic size of public/logo-red.png (tight-cropped from the client's supplied artwork).
const LOGO_ASPECT = 1724 / 319;

const maskStyle = {
  maskImage: "url(/logo-red.png)",
  WebkitMaskImage: "url(/logo-red.png)",
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
export function AnimatedLogo({ size = 21, className }: { size?: number; className?: string }) {
  const shouldAnimate = useSyncExternalStore(emptySubscribe, getShouldAnimate, getServerSnapshot);

  useEffect(() => {
    if (shouldAnimate) sessionStorage.setItem(SESSION_KEY, "1");
  }, [shouldAnimate]);

  const width = Math.round(size * LOGO_ASPECT);

  return (
    <Link
      href="/"
      className={cn("flex shrink-0 flex-col items-center gap-0.5 leading-none", className)}
      aria-label={siteConfig.name}
    >
      <motion.span
        className="relative block"
        style={{ width, height: size }}
        initial={shouldAnimate ? { opacity: 0, scale: 0.85, y: 6 } : false}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Image src="/logo-red.png" alt={siteConfig.name} width={width} height={size} priority className="object-contain" />
        <span aria-hidden className="animate-logo-shine pointer-events-none absolute inset-0" style={maskStyle} />
      </motion.span>
      <span className="text-[9px] leading-none font-bold tracking-[0.08em] whitespace-nowrap text-text uppercase sm:text-[11px] sm:tracking-[0.12em]">
        {siteConfig.name}
      </span>
    </Link>
  );
}
