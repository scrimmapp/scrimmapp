"use client";

import { motion } from "motion/react";

export function AnimatedHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto max-w-xl px-4 py-1.5 text-center"
    >
      {/* soft glow behind the text so it stays crisp over the pitch pattern, no box, no border */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-[3rem] bg-paper/70 blur-2xl"
        aria-hidden
      />

      <motion.span
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="inline-flex items-center gap-1.5 rounded-pill border border-gold/30 bg-gold-bg px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gold-ink"
      >
        Southern California · Rec, Club & High School
      </motion.span>
      <h1 className="mt-0.5 font-display text-lg font-extrabold leading-[1.2] tracking-tight text-ink sm:text-xl">
        Find your next scrimmage before the whistle blows.
      </h1>
      <p className="mt-0.5 mx-auto max-w-md text-[12px] text-ink-2">
        A classifieds marketplace for pre-season friendlies. Post an open match window, filter by
        level and travel radius, and connect directly with the opposing coach.
      </p>
    </motion.section>
  );
}
