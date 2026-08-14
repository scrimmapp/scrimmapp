"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export function AmbientBlobs({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <motion.div
        className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-pitch/20 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-gold/20 blur-3xl"
        animate={{ x: [0, -25, 0], y: [0, -25, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-navy/10 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
