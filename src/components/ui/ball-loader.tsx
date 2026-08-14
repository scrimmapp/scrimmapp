"use client";

import { motion } from "motion/react";

export function BallLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative h-16 w-16">
        <motion.div
          className="absolute inset-0"
          animate={{ y: [0, -22, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
        >
          <motion.svg
            viewBox="0 0 48 48"
            className="h-16 w-16 drop-shadow-md"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="24" cy="24" r="21" fill="white" stroke="#0d2544" strokeWidth="2" />
            <g stroke="#0d2544" strokeWidth="1.6" strokeLinejoin="round" fill="#0d2544">
              <polygon points="24,12 30,17 28,24 20,24 18,17" />
              <polygon points="24,12 30,17 36,14" fill="none" />
              <polygon points="18,17 12,15" fill="none" />
              <polygon points="20,24 16,31" fill="none" />
              <polygon points="28,24 32,31" fill="none" />
            </g>
          </motion.svg>
        </motion.div>
        <motion.div
          className="absolute -bottom-1 left-1/2 h-2 w-10 -translate-x-1/2 rounded-full bg-ink/15"
          animate={{ scaleX: [1, 0.55, 1], opacity: [0.5, 0.18, 0.5] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
        />
      </div>

      <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-muted">
        <span>{label}</span>
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1 w-1 rounded-full bg-pitch"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
