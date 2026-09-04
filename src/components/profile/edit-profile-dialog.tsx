"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfileAction } from "@/lib/actions/profile";
import { genderToDisplay, levelToDisplay } from "@/db/mappers";
import { ageGroups } from "@/lib/taxonomy";
import type { profiles } from "@/db/schema";

type ProfileRow = typeof profiles.$inferSelect;

export function EditProfileDialog({
  profile,
  open,
  onClose,
}: {
  profile: ProfileRow;
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

    const result = await updateProfileAction(new FormData(e.currentTarget));
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Edit Coach Profile">
      <form key={profile.id} onSubmit={handleSubmit} className="space-y-2.5">
        {error && (
          <p className="rounded-control border border-crit/30 bg-crit-bg px-3 py-2 text-[12px] font-semibold text-crit">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <Field label="Coach name" htmlFor="profile-coachName">
            <Input id="profile-coachName" name="coachName" defaultValue={profile.coachName} required />
          </Field>
          <Field label="Team name" htmlFor="profile-teamName">
            <Input id="profile-teamName" name="teamName" defaultValue={profile.teamName} required />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <Field label="Club name (optional)" htmlFor="profile-clubName">
            <Input id="profile-clubName" name="clubName" defaultValue={profile.clubName ?? ""} placeholder="e.g. Irvine Strikers FC" />
          </Field>
          <Field label="Program level" htmlFor="profile-orgType">
            <Select id="profile-orgType" name="orgType" defaultValue={levelToDisplay(profile.orgType)}>
              <option value="Club">Club Soccer</option>
              <option value="High School">High School Program</option>
              <option value="Rec">Recreational / AYSO</option>
              <option value="Futsal">Futsal</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <Field label="Division (optional)" htmlFor="profile-division">
            <Input id="profile-division" name="division" defaultValue={profile.division ?? ""} placeholder="e.g. CIF Division 2" />
          </Field>
          <Field label="Default age group (optional)" htmlFor="profile-defaultAgeGroup">
            <Select id="profile-defaultAgeGroup" name="defaultAgeGroup" defaultValue={profile.defaultAgeGroup ?? ""}>
              <option value="">Not set</option>
              {ageGroups.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <Field label="Default gender (optional)" htmlFor="profile-defaultGender">
            <Select id="profile-defaultGender" name="defaultGender" defaultValue={profile.defaultGender ? genderToDisplay(profile.defaultGender) : ""}>
              <option value="">Not set</option>
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
            </Select>
          </Field>
          <Field label="Phone (optional)" htmlFor="profile-phone">
            <Input id="profile-phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} placeholder="(555) 555-5555" />
          </Field>
        </div>

        <Field label="Contact email" htmlFor="profile-contactEmail">
          <Input id="profile-contactEmail" name="contactEmail" type="email" defaultValue={profile.contactEmail} required />
        </Field>
        <p className="text-[11px] text-muted">
          This is the email other coaches see, separate from your login email.
        </p>

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
