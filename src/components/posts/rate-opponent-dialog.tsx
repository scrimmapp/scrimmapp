"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { submitRatingAction } from "@/lib/actions/ratings";

const checklistItems = [
  { key: "onTime", label: "Was the opponent coach/team punctual / on time?" },
  { key: "goodCommunication", label: "Did they have good communication / quick response time?" },
  { key: "accurateFieldInfo", label: "Was the field/parking info they gave accurate?" },
  { key: "paidRefFee", label: "Did they pay their agreed referee fee share?" },
] as const;

export function RateOpponentDialog({
  connectionId,
  opponentTeamName,
  open,
  onClose,
}: {
  connectionId: string;
  opponentTeamName: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [stars, setStars] = useState(5);
  const [checks, setChecks] = useState<Record<string, boolean>>({
    onTime: true,
    goodCommunication: true,
    accurateFieldInfo: true,
    paidRefFee: true,
  });
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    const result = await submitRatingAction(connectionId, {
      stars,
      onTime: checks.onTime,
      goodCommunication: checks.goodCommunication,
      accurateFieldInfo: checks.accurateFieldInfo,
      paidRefFee: checks.paidRefFee,
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
    <Dialog open={open} onClose={onClose} title={`Rate ${opponentTeamName}`}>
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
