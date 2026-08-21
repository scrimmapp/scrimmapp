"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cancelListingAction } from "@/lib/actions/listings";
import { cancellationReasonOptions } from "@/lib/taxonomy";

export function CancelListingDialog({
  listingId,
  open,
  onClose,
}: {
  listingId: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const reasonCode = String(form.get("reasonCode")) as Parameters<typeof cancelListingAction>[1];
    const reasonText = String(form.get("reasonText") || "");
    const result = await cancelListingAction(listingId, reasonCode, reasonText);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Cancel This Listing">
      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="text-[13px] text-ink-2">
          This takes the listing off the open board. It stays on record as cancelled and can&rsquo;t be undone from here.
        </p>
        {error && (
          <p className="rounded-control border border-crit/30 bg-crit-bg px-3 py-2 text-[12px] font-semibold text-crit">
            {error}
          </p>
        )}
        <Field label="Reason" htmlFor="cancel-reason">
          <Select id="cancel-reason" name="reasonCode" defaultValue="schedule_conflict">
            {cancellationReasonOptions.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Details (optional)" htmlFor="cancel-text">
          <Textarea id="cancel-text" name="reasonText" rows={2} placeholder="Anything opposing coaches should know" />
        </Field>
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" className="flex-1 normal-case" onClick={onClose}>
            Never mind
          </Button>
          <Button type="submit" variant="danger" className="flex-[2]" disabled={saving}>
            {saving ? "Cancelling…" : "Cancel Listing"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
