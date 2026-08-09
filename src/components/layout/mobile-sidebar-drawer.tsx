"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { CategoryLinks } from "@/components/layout/category-sidebar";

export function MobileSidebarDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
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
                aria-label="मेनू बंद करें"
                className="flex size-9 items-center justify-center rounded-full text-text hover:text-accent"
              >
                <X className="size-5" />
              </button>
            </div>
            <div onClick={onClose}>
              <CategoryLinks />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
