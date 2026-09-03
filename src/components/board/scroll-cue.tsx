"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

export function ScrollCue({ targetId }: { targetId: string }) {
  const [pastFold, setPastFold] = useState(false);

  useEffect(() => {
    function onScroll() {
      setPastFold(window.scrollY > 120);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleClick() {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: pastFold ? 0 : 1 }}
      transition={{ duration: pastFold ? 0.2 : 0.5, delay: pastFold ? 0 : 0.7 }}
      aria-hidden={pastFold}
      style={{ pointerEvents: pastFold ? "none" : "auto" }}
      aria-label="Scroll to see the scrimmage board"
      className="fixed bottom-3 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-0.5 text-ink-2 transition-colors hover:text-pitch sm:flex"
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
