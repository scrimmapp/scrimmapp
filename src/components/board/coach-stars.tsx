import { Star } from "lucide-react";

// Fractional fill (e.g. a 2.5 average shades exactly two and a half stars) rather than
// rounding to a whole star, per Javi Sep 2026. Each star stacks an outline base with a
// gold-filled copy clipped to that star's share of the score.
export function CoachStars({
  reliabilityScore,
  ratingsCount,
  size = 9,
}: {
  reliabilityScore: number;
  ratingsCount: number;
  size?: number;
}) {
  const hasRatings = ratingsCount > 0;

  return (
    <span className="flex shrink-0 items-center gap-1">
      <span className="flex items-center gap-px">
        {[0, 1, 2, 3, 4].map((i) => {
          const fraction = hasRatings ? Math.max(0, Math.min(1, reliabilityScore - i)) : 0;
          return (
            <span key={i} className="relative inline-block shrink-0" style={{ width: size, height: size }}>
              <Star size={size} strokeWidth={1.5} className="absolute inset-0 text-rule-2" />
              {fraction > 0 && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fraction * 100}%` }}>
                  <Star size={size} strokeWidth={0} className="fill-gold text-gold" />
                </span>
              )}
            </span>
          );
        })}
      </span>
      {hasRatings && <span className="text-ink-2">{reliabilityScore.toFixed(1)}</span>}
    </span>
  );
}
