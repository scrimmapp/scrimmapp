"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { BallGlyph, balls } from "@/components/ui/floating-ball";
import { cn } from "@/lib/cn";

type Phase = "idle" | "kicking" | "goal" | "save" | "resetting";

const CONFETTI_COLORS = ["bg-pitch", "bg-gold", "bg-navy", "bg-crit"];

// A small hint of a goal frame at each side of the screen: what a clicked ball is actually
// aiming at. Kept as quiet as the rest of the ambient decoration until something is scored on it.
export function GoalPost({ side }: { side: "left" | "right" }) {
  return (
    <div
      className="pointer-events-none absolute top-[42%] text-ink-2 opacity-[0.13]"
      style={side === "left" ? { left: "1%" } : { right: "1%" }}
      aria-hidden
    >
      <svg width="52" height="44" viewBox="0 0 52 44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 42V4h44v38" />
        <g strokeWidth="0.7" opacity="0.6">
          <path d="M4 12h44M4 20h44M4 28h44M4 36h44" />
          <path d="M8 6v34M16 5v35M26 4v36M36 5v35M44 6v34" />
        </g>
      </svg>
    </div>
  );
}

function Goalkeeper() {
  return (
    <motion.svg
      width="34"
      height="34"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-navy-ink"
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ duration: 0.25, ease: "backOut" }}
    >
      <circle cx="20" cy="9" r="4" fill="currentColor" stroke="none" />
      <path d="M20 13v14" />
      <path d="M20 15L6 8" />
      <path d="M20 15L34 8" />
      <path d="M20 27L10 37" />
      <path d="M20 27L30 37" />
    </motion.svg>
  );
}

function ConfettiBurst() {
  const [pieces] = useState(() =>
    Array.from({ length: 14 }, (_, i) => ({
      angle: (i / 14) * Math.PI * 2 + Math.random() * 0.4,
      distance: 34 + Math.random() * 28,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: (i % 4) * 0.03,
    })),
  );

  return (
    <>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className={cn("absolute h-1.5 w-1 rounded-[1px]", p.color)}
          style={{ left: "50%", top: "50%" }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance + 18,
            opacity: 0,
            rotate: 320,
          }}
          transition={{ duration: 0.9, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

function OutcomeText({ tone }: { tone: "goal" | "save" }) {
  return (
    <motion.div
      className={cn(
        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-pill px-2.5 py-1 font-display text-[11px] font-black uppercase tracking-widest shadow-lg",
        tone === "goal" ? "bg-gold text-gold-contrast" : "bg-navy text-navy-contrast",
      )}
      initial={{ scale: 0, opacity: 0, rotate: -6 }}
      animate={{ scale: [0, 1.3, 1], opacity: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -8 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {tone === "goal" ? "Goal!" : "Saved!"}
    </motion.div>
  );
}

// A decorative ball that doubles as a tiny easter egg: click it and it takes a shot at the
// nearest goal, resolving into a celebration or a save before drifting back into the ambient
// background loop it started from.
function KickableBall({ b }: { b: (typeof balls)[number] }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const outcomeRef = useRef<"goal" | "save">("goal");

  const topPct = parseFloat(b.top);
  const leftPct = parseFloat(b.left);
  const side: "left" | "right" = leftPct < 50 ? "left" : "right";
  const kickXvw = side === "left" ? 4 - leftPct : 96 - leftPct;
  const kickYvh = 42 - topPct;

  function handleClick() {
    if (phase !== "idle") return;
    outcomeRef.current = Math.random() < 0.6 ? "goal" : "save";
    setPhase("kicking");
  }

  function handleAnimationComplete() {
    if (phase === "kicking") {
      setPhase(outcomeRef.current);
      window.setTimeout(() => setPhase("resetting"), 1100);
    } else if (phase === "resetting") {
      setPhase("idle");
    }
  }

  const animate =
    phase === "idle"
      ? { x: [0, 30, -20, 0], y: [0, -25, 15, 0], rotate: [0, 180, 320, 360], scale: 1, opacity: 1 }
      : phase === "kicking"
        ? { x: `${kickXvw}vw`, y: `${kickYvh}vh`, rotate: 900, scale: 1.15, opacity: 1 }
        : phase === "goal"
          ? { x: `${kickXvw}vw`, y: `${kickYvh}vh`, rotate: 900, scale: 0.25, opacity: 0 }
          : phase === "save"
            ? { x: `${kickXvw * 0.45}vw`, y: `${kickYvh * 0.3 - 4}vh`, rotate: 1160, scale: 0.85, opacity: 1 }
            : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };

  const transition =
    phase === "idle"
      ? { duration: b.duration, delay: b.delay, repeat: Infinity, ease: "easeInOut" as const }
      : phase === "kicking"
        ? { duration: 0.5, ease: [0.3, 0, 0.6, 1] as const }
        : phase === "resetting"
          ? { duration: 0.7, ease: "easeInOut" as const }
          : { duration: 0.4, ease: "easeOut" as const };

  return (
    <motion.div
      className="pointer-events-auto absolute cursor-pointer opacity-[0.16]"
      style={{ top: b.top, left: b.left }}
      animate={animate}
      transition={transition}
      onAnimationComplete={handleAnimationComplete}
      onClick={handleClick}
      whileHover={phase === "idle" ? { scale: 1.25, opacity: 0.4 } : undefined}
      aria-hidden
    >
      <BallGlyph size={b.size} />

      <AnimatePresence>
        {phase === "goal" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <ConfettiBurst />
            <OutcomeText tone="goal" />
          </div>
        )}
        {phase === "save" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute -translate-y-2">
              <Goalkeeper />
            </div>
            <OutcomeText tone="save" />
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// SiteBackground itself sits at z-[-10] so it never competes with real content, but that also
// puts it behind every ordinary page element in the click hit-test order (a transparent div
// with default stacking still wins a click over something painted behind it). Portaling just
// the clickable balls to the end of <body> lets them paint above page content and actually
// receive clicks, while the wrapper's own pointer-events-none keeps empty space click-through.
export function KickableBalls() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time SSR/portal-readiness guard
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      {balls.map((b, i) => (
        <KickableBall key={i} b={b} />
      ))}
    </div>,
    document.body,
  );
}
