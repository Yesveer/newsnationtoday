import { cn } from "@/lib/cn";

/** Placeholder ad rectangle — single swap-in point for real ad tags in Phase 2. */
export function AdSlot({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-64 w-full items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted text-xs text-text-muted",
        className,
      )}
    >
      विज्ञापन
    </div>
  );
}
