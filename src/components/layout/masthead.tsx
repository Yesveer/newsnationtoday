"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, Search } from "lucide-react";
import { AnimatedLogo } from "@/components/brand/animated-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MobileSidebarDrawer } from "@/components/layout/mobile-sidebar-drawer";
import { cn } from "@/lib/cn";

const utilityLinks = [
  { label: "होम", href: "/", icon: Home },
  { label: "सर्च", href: "/search", icon: Search },
];

export function Masthead() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-bg">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <AnimatedLogo size={28} />

        <nav className="hidden items-center gap-1 sm:flex">
          {utilityLinks.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  active ? "text-accent" : "text-text-muted hover:text-accent",
                )}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/search"
            aria-label="खोजें"
            className="flex size-9 items-center justify-center rounded-full text-text transition-colors hover:text-accent sm:hidden"
          >
            <Search className="size-4" />
          </Link>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="मेनू खोलें"
            className="flex size-9 items-center justify-center rounded-full text-text transition-colors hover:text-accent lg:hidden"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      <MobileSidebarDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
