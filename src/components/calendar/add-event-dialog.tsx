"use client";

import { useState, type FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data";
import { timeWindowOptions } from "@/lib/taxonomy";
import type { CalendarEvent, TimeWindow } from "@/lib/types";

const kindOptions: { value: CalendarEvent["kind"]; label: string }[] = [
  { value: "league", label: "League fixture" },
  { value: "tournament", label: "Tournament" },
  { value: "practice", label: "Practice" },
  { value: "blackout", label: "Blackout / fields closed" },
];

export function AddEventDialog({
  open,
  onClose,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  defaultDate: string;
}) {
  const { addCalendarEvent } = useAppData();
  const [kind, setKind] = useState<CalendarEvent["kind"]>("league");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") || "").trim();
    const date = String(form.get("date") || "");
    if (!title || !date) return;

    addCalendarEvent({
      title,
      date,
      time: form.get("time") as TimeWindow,
      kind,
      location: String(form.get("location") || "").trim() || undefined,
    });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Log Calendar Entry">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Title / opponent" htmlFor="cal-title">
          <Input id="cal-title" name="title" placeholder="e.g. League fixture vs Mission Viejo" required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" htmlFor="cal-date">
            <Input id="cal-date" name="date" type="date" defaultValue={defaultDate} required />
          </Field>
          <Field label="Time slot" htmlFor="cal-time">
            <Select id="cal-time" name="time" defaultValue="Morning">
              {timeWindowOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Type" htmlFor="cal-kind">
          <Select id="cal-kind" value={kind} onChange={(e) => setKind(e.target.value as CalendarEvent["kind"])}>
            {kindOptions.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Location (optional)" htmlFor="cal-location">
          <Input id="cal-location" name="location" placeholder="Home pitch" />
        </Field>
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" className="flex-1 normal-case" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" className="flex-[2]">
            Save to Planner
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
