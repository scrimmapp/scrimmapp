"use client";

import { motion } from "motion/react";
import { PitchPattern } from "@/components/ui/pitch-pattern";
import { GoalPost, KickableBalls } from "@/components/ui/kickable-ball";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function SiteBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* floodlight glows, one per accent color, kept quiet */}
      <motion.div
        className="absolute -left-1/4 -top-1/3 h-[58vw] w-[58vw] rounded-full bg-pitch/[0.055] blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], opacity: [0.6, 0.85, 0.6] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-1/4 top-1/4 h-[52vw] w-[52vw] rounded-full bg-gold/[0.05] blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -30, 0], opacity: [0.6, 0.85, 0.6] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[42vw] w-[42vw] rounded-full bg-navy/[0.06] blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* the pitch itself */}
      <PitchPattern />

      {/* a goal at each side of the screen, and the drifting balls that can shoot on them */}
      <GoalPost side="left" />
      <GoalPost side="right" />
      <KickableBalls />

      {/* grain */}
      <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
    </div>
  );
}
