"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea, Checkbox } from "@/components/ui/input";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { Button } from "@/components/ui/button";
import { updateListingAction } from "@/lib/actions/listings";
import { ageGroupsFor, refFeeOptions, subLevelsFor, timeWindowOptions, travelRadiusOptions } from "@/lib/taxonomy";
import type { Gender, Level, Listing } from "@/lib/types";

export function EditListingDialog({
  listing,
  open,
  onClose,
}: {
  listing: Listing;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [level, setLevel] = useState<Level>(listing.level);
  const [gender, setGender] = useState<Gender>(listing.gender);
  const [subLevel, setSubLevel] = useState(listing.subLevel);
  const [age, setAge] = useState(listing.age);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleLevelChange(next: Level) {
    setLevel(next);
    setSubLevel(subLevelsFor(next, gender)[0]);
    setAge(ageGroupsFor(next)[0]);
  }

  function handleGenderChange(next: Gender) {
    setGender(next);
    setSubLevel(subLevelsFor(level, next)[0]);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);

    const result = await updateListingAction(listing.id, new FormData(e.currentTarget));
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Edit Scrimmage Listing" className="max-w-2xl">
      <form key={listing.id} onSubmit={handleSubmit} className="space-y-2.5">
        {error && (
          <p className="rounded-control border border-crit/30 bg-crit-bg px-3 py-2 text-[12px] font-semibold text-crit">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <Field label="Team name & club" htmlFor="edit-teamName">
            <Input id="edit-teamName" name="teamName" defaultValue={listing.teamName} required />
          </Field>
          <Field label="League level" htmlFor="edit-level">
            <Select id="edit-level" name="level" value={level} onChange={(e) => handleLevelChange(e.target.value as Level)}>
              <option value="Club">Club Soccer</option>
              <option value="High School">High School Program</option>
              <option value="Rec">Recreational / AYSO</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
          <Field label="Gender" htmlFor="edit-gender">
            <Select id="edit-gender" name="gender" value={gender} onChange={(e) => handleGenderChange(e.target.value as Gender)}>
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
            </Select>
          </Field>
          <Field label="Age group" htmlFor="edit-age">
            <Select id="edit-age" name="age" value={age} onChange={(e) => setAge(e.target.value)}>
              {ageGroupsFor(level).map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Select>
          </Field>
          <Field label="Sub-tier / division" htmlFor="edit-subLevel">
            <Select id="edit-subLevel" name="subLevel" value={subLevel} onChange={(e) => setSubLevel(e.target.value)}>
              {subLevelsFor(level, gender).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
          <Field label="Preferred date" htmlFor="edit-date">
            <Input id="edit-date" name="date" type="date" defaultValue={listing.date} required />
          </Field>
          <Field label="Time window" htmlFor="edit-time">
            <Select id="edit-time" name="time" defaultValue={listing.time}>
              {timeWindowOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Willing to travel" htmlFor="edit-travelRadius">
            <Select id="edit-travelRadius" name="travelRadius" defaultValue={listing.travelRadius}>
              {travelRadiusOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <Field label="Pitch location / city" htmlFor="edit-location">
            <LocationAutocomplete name="location" defaultValue={listing.location} required />
          </Field>
          <Field label="Referee fee allocation" htmlFor="edit-refFee">
            <Select id="edit-refFee" name="refFee" defaultValue={listing.refFee}>
              {refFeeOptions.map((r) => (
                <option key={r} value={r}>
                  {r === "Host Pays Ref" ? "Host Pays Official" : r === "Visitor Pays" ? "Visitor Pays Official" : r}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <Field label="Field # / Notes (optional)" htmlFor="edit-notes">
            <Textarea id="edit-notes" name="notes" rows={2} defaultValue={listing.notes} />
          </Field>
          <div className="flex flex-col justify-center gap-2 rounded-control border border-rule bg-paper p-2.5">
            <label className="flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-ink-2">
              <Checkbox name="isHosting" defaultChecked={listing.isHosting} />
              We have field time secured (hosting)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-ink-2">
              <Checkbox name="hasFieldFee" defaultChecked={listing.hasFieldFee} />
              Requires field rental fee share
            </label>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" className="flex-1 normal-case" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" className="flex-[2]" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
