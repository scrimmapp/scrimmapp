"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCalendarEventAction, updateCalendarEventAction } from "@/lib/actions/calendar-events";
import { timeWindowOptions } from "@/lib/taxonomy";
import type { CalendarEvent } from "@/lib/types";

const kindOptions: { value: CalendarEvent["kind"]; label: string }[] = [
  { value: "league", label: "League fixture" },
  { value: "tournament", label: "Tournament" },
  { value: "practice", label: "Practice" },
  { value: "blackout", label: "Blackout / fields closed" },
];

export type EditableCalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: CalendarEvent["time"];
  kind: CalendarEvent["kind"];
  location?: string;
};

export function AddEventDialog({
  open,
  onClose,
  defaultDate,
  event,
}: {
  open: boolean;
  onClose: () => void;
  defaultDate: string;
  event?: EditableCalendarEvent | null;
}) {
  const router = useRouter();
  const isEditing = !!event;
  const [kind, setKind] = useState<CalendarEvent["kind"]>(event?.kind ?? "league");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = isEditing
      ? await updateCalendarEventAction(event.id, formData)
      : await createCalendarEventAction(formData);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title={isEditing ? "Edit Calendar Entry" : "Log Calendar Entry"}>
      <form key={event?.id ?? "new"} onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <p className="rounded-control border border-crit/30 bg-crit-bg px-3 py-2 text-[12px] font-semibold text-crit">
            {error}
          </p>
        )}
        <Field label="Title / opponent" htmlFor="cal-title">
          <Input id="cal-title" name="title" placeholder="e.g. League fixture vs Mission Viejo" defaultValue={event?.title} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" htmlFor="cal-date">
            <Input id="cal-date" name="date" type="date" defaultValue={event?.date ?? defaultDate} required />
          </Field>
          <Field label="Time slot" htmlFor="cal-time">
            <Select id="cal-time" name="time" defaultValue={event?.time ?? "Morning"}>
              {timeWindowOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Type" htmlFor="cal-kind">
          <Select id="cal-kind" name="kind" value={kind} onChange={(e) => setKind(e.target.value as CalendarEvent["kind"])}>
            {kindOptions.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Location (optional)" htmlFor="cal-location">
          <Input id="cal-location" name="location" placeholder="Home pitch" defaultValue={event?.location} />
        </Field>
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" className="flex-1 normal-case" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" className="flex-[2]" disabled={saving}>
            {saving ? "Saving…" : isEditing ? "Save Changes" : "Save to Planner"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
