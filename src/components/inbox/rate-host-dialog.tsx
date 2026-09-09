"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { submitHostRatingAction } from "@/lib/actions/ratings";

// A faster, tap-through checklist than the owner-side rating: per Javi, the visiting coach
// should be able to leave this in about 10 seconds on a phone after the match.
const checklistItems = [
  { key: "accurateFieldInfo", label: "Accurate field & parking info (pin dropped at the right lot, easy to find)" },
  { key: "onTime", label: "Punctual kickoff (field setup and match started on time)" },
  { key: "fieldSetupQuality", label: "Great field setup & equipment (nets, flags, and goals ready)" },
  { key: "refereesAsAgreed", label: "Referees as agreed (officials showed up, fee split honored)" },
  { key: "evenlyMatchedTier", label: "Evenly matched / honest tier (brought the agreed age/level)" },
  { key: "respectfulSidelines", label: "Respectful sidelines (sportsmanship from host coaches, players, and parents)" },
] as const;

export function RateHostDialog({
  connectionId,
  hostTeamName,
  open,
  onClose,
}: {
  connectionId: string;
  hostTeamName: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [stars, setStars] = useState(5);
  const [checks, setChecks] = useState<Record<string, boolean>>({
    accurateFieldInfo: true,
    onTime: true,
    fieldSetupQuality: true,
    refereesAsAgreed: true,
    evenlyMatchedTier: true,
    respectfulSidelines: true,
  });
  const [wouldTravelAgain, setWouldTravelAgain] = useState(true);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    const result = await submitHostRatingAction(connectionId, {
      stars,
      accurateFieldInfo: checks.accurateFieldInfo,
      onTime: checks.onTime,
      fieldSetupQuality: checks.fieldSetupQuality,
      refereesAsAgreed: checks.refereesAsAgreed,
      evenlyMatchedTier: checks.evenlyMatchedTier,
      respectfulSidelines: checks.respectfulSidelines,
      wouldTravelAgain,
      comment,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title={`Rate ${hostTeamName}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="text-[12px] font-semibold text-crit">{error}</p>}

        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">Overall rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setStars(n)}
                className={`text-2xl leading-none ${n <= stars ? "text-gold" : "text-rule-2"}`}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          {checklistItems.map((item) => (
            <label key={item.key} className="flex items-start gap-2 text-[13px] text-ink-2">
              <input
                type="checkbox"
                checked={checks[item.key]}
                onChange={(e) => setChecks((c) => ({ ...c, [item.key]: e.target.checked }))}
                className="mt-0.5 accent-pitch"
              />
              {item.label}
            </label>
          ))}
        </div>

        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">
            Would you travel to play this host again?
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setWouldTravelAgain(true)}
              className={`flex-1 rounded-control border px-3 py-1.5 text-[13px] font-bold transition-colors ${
                wouldTravelAgain ? "border-pitch bg-pitch-bg text-pitch-ink" : "border-rule-2 text-ink-2"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setWouldTravelAgain(false)}
              className={`flex-1 rounded-control border px-3 py-1.5 text-[13px] font-bold transition-colors ${
                !wouldTravelAgain ? "border-crit bg-crit-bg text-crit" : "border-rule-2 text-ink-2"
              }`}
            >
              No
            </button>
          </div>
        </div>

        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">Comments (optional)</p>
          <Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Anything else worth noting?" />
        </div>

        <Button type="submit" variant="accent" className="w-full" disabled={saving}>
          {saving ? "Submitting…" : "Submit Rating"}
        </Button>
      </form>
    </Dialog>
  );
}
