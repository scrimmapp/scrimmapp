"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * A full stylized soccer pitch: boundary, mowed stripes, both penalty
 * boxes, center circle. Stripes carry a faint grass tint; the markings
 * themselves are neutral (like real painted lines), so the pattern reads
 * as "a pitch" without flooding the page in brand green.
 */
export function PitchPattern({ className }: { className?: string }) {
  const stripeWidth = 1480 / 12;
  const stripes = Array.from({ length: 12 }, (_, i) => 60 + i * stripeWidth);

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      aria-hidden
    >
      {/* mowed-turf stripes, faint grass tint */}
      <g className="text-pitch">
        {stripes.map((x, i) => (
          <rect key={x} x={x} y={60} width={stripeWidth} height={780} fill="currentColor" opacity={i % 2 === 0 ? 0.028 : 0.012} />
        ))}
      </g>

      {/* markings: neutral, like painted lines */}
      <g className="text-ink-2">
        <rect x="60" y="60" width="1480" height="780" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.13" />

        <motion.line
          x1="800" y1="60" x2="800" y2="840"
          stroke="currentColor" strokeWidth="2" opacity="0.13"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />

        <motion.circle
          cx="800" cy="450" r="160"
          fill="none" stroke="currentColor" strokeWidth="2" opacity="0.13"
          initial={{ pathLength: 0, scale: 0.85, opacity: 0 }}
          animate={{ pathLength: 1, scale: 1, opacity: 0.13 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          style={{ transformOrigin: "800px 450px" }}
        />
        <circle cx="800" cy="450" r="5" fill="currentColor" opacity="0.16" />

        <rect x="60" y="250" width="260" height="400" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.11" />
        <rect x="60" y="350" width="90" height="200" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.11" />
        <circle cx="250" cy="450" r="4" fill="currentColor" opacity="0.14" />
        <path d="M 320 340 A 160 160 0 0 1 320 560" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.1" />

        <rect x="1280" y="250" width="260" height="400" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.11" />
        <rect x="1450" y="350" width="90" height="200" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.11" />
        <circle cx="1350" cy="450" r="4" fill="currentColor" opacity="0.14" />
        <path d="M 1280 340 A 160 160 0 0 0 1280 560" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.1" />

        <path d="M 60 88 A 28 28 0 0 1 88 60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.11" />
        <path d="M 1512 60 A 28 28 0 0 1 1540 88" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.11" />
        <path d="M 1540 812 A 28 28 0 0 1 1512 840" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.11" />
        <path d="M 88 840 A 28 28 0 0 1 60 812" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.11" />
      </g>
    </svg>
  );
}
