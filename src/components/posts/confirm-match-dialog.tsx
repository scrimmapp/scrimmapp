"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { confirmListingMatchAction } from "@/lib/actions/listings";

export interface Inquirer {
  connectionId: string;
  profileId: string;
  teamName: string;
  coachName: string;
}

export function ConfirmMatchDialog({
  listingId,
  inquirers,
  open,
  onClose,
}: {
  listingId: string;
  inquirers: Inquirer[];
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(inquirers[0]?.profileId ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving || !selected) return;
    setSaving(true);
    setError(null);
    const result = await confirmListingMatchAction(listingId, selected);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Confirm your opponent">
      {inquirers.length === 0 ? (
        <p className="text-[13px] text-ink-2">
          No one has inquired about this listing yet. Once a coach reaches out, you can confirm the match here.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-[12px] font-semibold text-crit">{error}</p>}
          <p className="text-[13px] text-ink-2">Pick who you&apos;re booking this scrimmage with:</p>
          <div className="space-y-1.5">
            {inquirers.map((i) => (
              <label
                key={i.connectionId}
                className="flex cursor-pointer items-center gap-2 rounded-control border border-rule-2 bg-paper px-3 py-2 text-[13px] font-semibold text-ink-2 has-[:checked]:border-pitch has-[:checked]:bg-pitch-bg has-[:checked]:text-pitch-ink"
              >
                <input
                  type="radio"
                  name="opponent"
                  value={i.profileId}
                  checked={selected === i.profileId}
                  onChange={() => setSelected(i.profileId)}
                  className="accent-pitch"
                />
                {i.teamName} <span className="text-muted">({i.coachName})</span>
              </label>
            ))}
          </div>
          <Button type="submit" variant="accent" className="w-full" disabled={saving || !selected}>
            {saving ? "Confirming…" : "Confirm Match"}
          </Button>
        </form>
      )}
    </Dialog>
  );
}
