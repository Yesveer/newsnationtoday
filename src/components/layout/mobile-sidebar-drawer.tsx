"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Home, HelpCircle, MessageSquare, MonitorPlay, Search, Video, X } from "lucide-react";
import { CategoryLinks } from "@/components/layout/category-sidebar";
import { useLanguage } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { utilityLinks, secondaryLinks } from "@/config/nav.config";

const linkMeta: Record<string, { icon: typeof Home; labelKey: TranslationKey; motion: string }> = {
  home: { icon: Home, labelKey: "nav.home", motion: "animate-icon-bob" },
  search: { icon: Search, labelKey: "nav.search", motion: "animate-icon-wiggle" },
  videos: { icon: Video, labelKey: "nav.videos", motion: "animate-icon-pulse" },
  watch: { icon: MonitorPlay, labelKey: "nav.watch", motion: "animate-icon-flicker" },
  faq: { icon: HelpCircle, labelKey: "menu.faq", motion: "" },
  feedback: { icon: MessageSquare, labelKey: "menu.feedback", motion: "" },
};

export function MobileSidebarDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto border-r border-border bg-surface p-4 shadow-lg lg:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="mb-2 flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                aria-label={t("drawer.close")}
                className="flex size-9 items-center justify-center rounded-full text-text hover:text-accent"
              >
                <X className="size-5" />
              </button>
            </div>
            <div onClick={onClose}>
              <CategoryLinks />

              <nav className="flex flex-col border-t border-border pt-2">
                {[...utilityLinks, ...secondaryLinks].map((link) => {
                  const meta = linkMeta[link.key] ?? linkMeta.home;
                  const Icon = meta.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-muted"
                    >
                      <Icon className={`size-4 shrink-0 ${meta.motion}`} />
                      {t(meta.labelKey)}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
