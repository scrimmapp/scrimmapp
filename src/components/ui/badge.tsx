import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "pitch" | "gold" | "good" | "warn" | "crit" | "muted";

const toneClasses: Record<Tone, string> = {
  pitch: "bg-pitch-bg text-pitch-ink border-pitch/25",
  gold: "bg-gold-bg text-gold-ink border-gold/30",
  good: "bg-good-bg text-good border-good/25",
  warn: "bg-warn-bg text-warn border-warn/25",
  crit: "bg-crit-bg text-crit border-crit/25",
  muted: "bg-surface-2 text-muted border-rule-2",
};

export function Badge({
  tone = "muted",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
