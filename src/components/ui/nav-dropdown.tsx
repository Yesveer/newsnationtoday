"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Small inline dropdown (no portal) used for the nav's language and account
 * menus. Rendered inside the header's stacking context on purpose — nothing
 * outside it can swallow the panel or its clicks.
 */
export function NavDropdown({
  trigger,
  label,
  children,
  className,
  panelClassName,
}: {
  trigger: ReactNode;
  label: string;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-full border border-border px-2 py-1.5 text-text transition-colors hover:border-accent hover:text-accent"
      >
        {trigger}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={() => setOpen(false)}
            className={cn(
              "absolute right-0 z-50 mt-2 min-w-52 rounded-xl border border-border bg-surface p-1.5 shadow-xl",
              panelClassName,
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NavDropdownLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-text-muted uppercase">{children}</p>
  );
}

export function NavDropdownSeparator() {
  return <div className="my-1 h-px bg-border" />;
}

const itemClass =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-text transition-colors hover:bg-surface-muted";

export function NavDropdownItem({
  children,
  onClick,
  href,
  active = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  active?: boolean;
}) {
  const content = (
    <>
      <span className="flex flex-1 items-center gap-2.5">{children}</span>
      {active && <Check className="size-4 shrink-0 text-accent" />}
    </>
  );

  if (href) {
    return (
      <Link href={href} role="menuitem" className={itemClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" role="menuitem" onClick={onClick} className={itemClass}>
      {content}
    </button>
  );
}
