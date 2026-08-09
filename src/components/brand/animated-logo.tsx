"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const SESSION_KEY = "newshub-logo-drawn";

function getShouldAnimate(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return sessionStorage.getItem(SESSION_KEY) !== "1";
}

const emptySubscribe = () => () => {};
const getServerSnapshot = () => false;

/**
 * Icon mark draws itself in via SVG pathLength once per browser session
 * (sessionStorage-gated, like StoneOks' site-loader), then renders fully
 * drawn on every subsequent mount — including route changes — so it never
 * replays mid-session. Shared with the future admin topbar (Phase 2).
 */
export function AnimatedLogo({ size = 34, className }: { size?: number; className?: string }) {
  const shouldAnimate = useSyncExternalStore(emptySubscribe, getShouldAnimate, getServerSnapshot);

  useEffect(() => {
    if (shouldAnimate) sessionStorage.setItem(SESSION_KEY, "1");
  }, [shouldAnimate]);

  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-2.5", className)} aria-label={siteConfig.name}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
        <motion.rect
          x="5.5"
          y="9.5"
          width="25"
          height="21"
          rx="3"
          stroke="var(--accent)"
          strokeWidth="2.5"
          initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
        <motion.path
          d="M11.5 17h13M11.5 22.5h9"
          stroke="var(--live)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={shouldAnimate ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
        />
      </svg>
      <span className="flex flex-col justify-center leading-none">
        <span className="font-display text-xl leading-none font-bold tracking-tight text-text">
          {siteConfig.name}
        </span>
        <svg width="100%" height="3" viewBox="0 0 100 3" preserveAspectRatio="none" className="mt-1 w-full" aria-hidden>
          <motion.path
            d="M0 1.5 H100"
            stroke="var(--accent)"
            strokeWidth="2"
            initial={shouldAnimate ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeInOut" }}
          />
        </svg>
      </span>
    </Link>
  );
}
