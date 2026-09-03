"use client";

import { motion } from "motion/react";

export function AnimatedHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto max-w-2xl px-4 py-2 text-center"
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="inline-flex items-center gap-1.5 rounded-pill border border-gold/30 bg-gold-bg px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold-ink"
      >
        Southern California · Rec, Club & High School
      </motion.span>
      <h1
        className="mt-3 font-display text-xl font-extrabold leading-[1.2] tracking-tight text-ink sm:text-2xl"
        style={{ textShadow: "0 0 10px var(--copy-glow), 0 0 10px var(--copy-glow)" }}
      >
        Find your next scrimmage before the whistle blows.
      </h1>
      <p
        className="mt-2 mx-auto max-w-lg text-[13px] text-ink-2 sm:text-sm"
        style={{ textShadow: "0 0 8px var(--copy-glow), 0 0 8px var(--copy-glow)" }}
      >
        A classifieds marketplace for pre-season friendlies. Post an open match window, filter by
        level and travel radius, and connect directly with the opposing coach.
      </p>
    </motion.section>
  );
}
