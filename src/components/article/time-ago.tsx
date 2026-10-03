"use client";

import { useSyncExternalStore } from "react";
import { formatAbsoluteDate, formatRelativeTime } from "@/lib/format-date";

/** "2 घंटे पहले", without a hydration mismatch.
 *
 *  A relative time computed during render is a different string on the server
 *  than it is a second later in the browser, and React treats that as a
 *  mismatched tree — which on a homepage full of cards meant a hydration
 *  error on nearly every load. `useSyncExternalStore` is the supported way
 *  out: the server snapshot is the absolute date, the client swaps in the
 *  relative one after hydration, and a ticker keeps it current.
 */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  // One interval for the whole page, however many timestamps are on it.
  timer ??= setInterval(() => {
    for (const notify of listeners) notify();
  }, 60_000);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function TimeAgo({ iso, className }: { iso: string; className?: string }) {
  // Returning a fresh string is safe: React compares snapshots by value, and
  // this one only changes when the minute does.
  const label = useSyncExternalStore(
    subscribe,
    () => formatRelativeTime(iso),
    () => formatAbsoluteDate(iso),
  );

  return (
    <time dateTime={iso} className={className}>
      {label}
    </time>
  );
}
