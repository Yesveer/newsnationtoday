"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { fadeUp, viewportOnce } from "@/lib/motion-variants";
import { cn } from "@/lib/cn";

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
