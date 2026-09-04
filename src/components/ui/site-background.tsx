"use client";

import { motion } from "motion/react";
import { PitchPattern } from "@/components/ui/pitch-pattern";
import { BallGlyph, balls } from "@/components/ui/floating-ball";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// A stadium floodlight rig: a row of bulbs mounted close together on one mast, so their
// individual glows overlap into a single bright mass with one shared soft bloom behind them,
// the way a bank of stadium lights actually reads from a distance, rather than several
// separate, isolated hotspots scattered around the frame.
function FloodlightCluster() {
  const bulbs = [-2.6, -1.3, 0, 1.3, 2.6];
  return (
    <div className="absolute left-1/2 top-[6%] h-0 w-0 site-scene-night">
      {/* one shared bloom behind the whole rig */}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
        style={{
          height: "14rem",
          width: "20rem",
          background:
            "radial-gradient(ellipse, rgba(255,246,224,0.5) 0%, rgba(255,238,196,0.22) 30%, rgba(255,229,158,0.08) 55%, transparent 75%)",
        }}
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* the bulbs themselves, close enough together to merge visually */}
      {bulbs.map((x, i) => (
        <div
          key={x}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{
            left: `${x}rem`,
            height: i === 2 ? "0.55rem" : "0.42rem",
            width: i === 2 ? "0.55rem" : "0.42rem",
            boxShadow: "0 0 8px 3px rgba(255,255,255,0.95), 0 0 22px 8px rgba(255,238,196,0.55)",
          }}
        />
      ))}
    </div>
  );
}

export function SiteBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* the pitch itself: full-bleed mowed grass + painted lines, base layer for both scenes */}
      <PitchPattern />

      {/* === Night scene: one floodlight rig, like the lights mounted behind a goal, plus a
          vignette that pools the light toward the middle of the pitch === */}
      <FloodlightCluster />
      <div
        className="absolute inset-0 site-scene-night"
        style={{ background: "radial-gradient(ellipse 100% 75% at 50% 40%, transparent 40%, rgba(0,0,0,0.55) 100%)" }}
      />

      {/* drifting balls */}
      {balls.map((b, i) => (
        <motion.div
          key={i}
          className="absolute opacity-[0.2]"
          style={{ top: b.top, left: b.left }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            rotate: [0, 180, 320, 360],
          }}
          transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <BallGlyph size={b.size} />
        </motion.div>
      ))}

      {/* grain */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
    </div>
  );
}
