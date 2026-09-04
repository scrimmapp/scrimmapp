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
            <circle cx="24" cy="24" r="21" fill="white" stroke="#111827" strokeWidth="1.5" />
            <g stroke="#111827" strokeWidth="1.5" strokeLinecap="round">
              <line x1="27.09" y1="19.75" x2="36.05" y2="7.42" />
              <line x1="29" y1="25.63" x2="43.5" y2="30.33" />
              <line x1="24" y1="29.26" x2="24" y2="44.5" />
              <line x1="19" y1="25.63" x2="4.5" y2="30.33" />
              <line x1="20.91" y1="19.75" x2="11.95" y2="7.42" />
            </g>
            <polygon fill="#111827" points="24,17.5 30.18,21.99 27.82,29.26 20.18,29.26 17.82,21.99" />
          </motion.svg>
        </motion.div>
        <motion.div
          className="absolute -bottom-1 left-1/2 h-2 w-10 -translate-x-1/2 rounded-full bg-ink/15"
          animate={{ scaleX: [1, 0.55, 1], opacity: [0.5, 0.18, 0.5] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
        />
      </div>

      <div className="field-caption flex items-center gap-1 text-[13px] font-bold uppercase tracking-widest">
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
