"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * A full-bleed, realistic mowed pitch: vertical mower stripes (like a real groundskeeper's
 * cut) cover the entire viewport edge to edge, with an accurately proportioned touchline,
 * penalty areas, and center circle drawn on top in painted-white. Grass colors and line opacity
 * are theme-driven CSS custom properties (see globals.css: --field-grass-a/b, --field-line),
 * so this one component is both the sunlit-day pitch and the floodlit-night pitch.
 */
export function PitchPattern({ className }: { className?: string }) {
  const tile = 100;

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      aria-hidden
    >
      <defs>
        <pattern id="mow" width={tile * 2} height={tile} patternUnits="userSpaceOnUse">
          <rect width={tile * 2} height={tile} fill="var(--field-grass-a)" />
          <rect x={tile} width={tile} height={tile} fill="var(--field-grass-b)" />
        </pattern>
      </defs>

      {/* the grass, edge to edge */}
      <rect x="0" y="0" width="1600" height="900" fill="url(#mow)" />

      {/* painted lines: an accurately proportioned pitch inset within the visible turf */}
      <g stroke="var(--field-line)" strokeWidth="3" fill="none" strokeLinecap="round">
        <rect x="60" y="60" width="1480" height="780" />

        <motion.line
          x1="800" y1="60" x2="800" y2="840"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />

        <motion.circle
          cx="800" cy="450" r="160"
          initial={{ pathLength: 0, scale: 0.85, opacity: 0 }}
          animate={{ pathLength: 1, scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          style={{ transformOrigin: "800px 450px" }}
        />
        <circle cx="800" cy="450" r="5" fill="var(--field-line)" />

        <rect x="60" y="250" width="260" height="400" />
        <rect x="60" y="350" width="90" height="200" />
        <circle cx="250" cy="450" r="4" fill="var(--field-line)" />
        <path d="M 320 340 A 160 160 0 0 1 320 560" />

        <rect x="1280" y="250" width="260" height="400" />
        <rect x="1450" y="350" width="90" height="200" />
        <circle cx="1350" cy="450" r="4" fill="var(--field-line)" />
        <path d="M 1280 340 A 160 160 0 0 0 1280 560" />

        <path d="M 60 88 A 28 28 0 0 1 88 60" />
        <path d="M 1512 60 A 28 28 0 0 1 1540 88" />
        <path d="M 1540 812 A 28 28 0 0 1 1512 840" />
        <path d="M 88 840 A 28 28 0 0 1 60 812" />
      </g>
    </svg>
  );
}
