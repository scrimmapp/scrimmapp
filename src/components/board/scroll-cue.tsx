"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

export function ScrollCue({ targetId, watchId }: { targetId: string; watchId?: string }) {
  const [pastFold, setPastFold] = useState(false);
  // Tracks whether the element the cue might visually overlap (the bottom of the post form)
  // is already on screen. A raw scrollY threshold alone isn't enough: on a short/medium
  // viewport with a tall form, that button can already be visible at scrollY 0, before any
  // scroll-based hide would kick in, which is exactly the overlap this was reported for.
  const [targetVisible, setTargetVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setPastFold(window.scrollY > 120);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!watchId) return;
    const el = document.getElementById(watchId);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setTargetVisible(entry.isIntersecting),
      { rootMargin: "0px 0px 80px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [watchId]);

  const hidden = pastFold || targetVisible;

  function handleClick() {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={{ duration: hidden ? 0.2 : 0.5, delay: hidden ? 0 : 0.7 }}
      aria-hidden={hidden}
      aria-label="Scroll to see the scrimmage board"
      className="fixed bottom-3 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-0.5 text-[var(--field-contrast)] transition-colors hover:text-gold sm:flex"
      style={{
        pointerEvents: hidden ? "none" : "auto",
        textShadow: "0 1px 3px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.3)",
      }}
    >
      <span className="text-[9px] font-bold uppercase tracking-widest">Scroll for the board</span>
      <motion.span
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown size={16} strokeWidth={2.5} />
      </motion.span>
    </motion.button>
  );
}
