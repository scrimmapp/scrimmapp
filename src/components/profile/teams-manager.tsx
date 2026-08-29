"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addTeamAction, deleteTeamAction } from "@/lib/actions/coach-teams";
import { ageGroups, subLevelsFor } from "@/lib/taxonomy";
import { genderToDisplay, levelToDisplay } from "@/db/mappers";
import type { Gender, Level } from "@/lib/types";
import type { coachTeams } from "@/db/schema";

type TeamRow = typeof coachTeams.$inferSelect;

const MAX_TEAMS = 3;

export function TeamsManager({ teams }: { teams: TeamRow[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [level, setLevel] = useState<Level>("Club");
  const [gender, setGender] = useState<Gender>("Boys");
  const [subLevel, setSubLevel] = useState(subLevelsFor("Club", "Boys")[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  function handleLevelChange(next: Level) {
    setLevel(next);
    setSubLevel(subLevelsFor(next, gender)[0]);
  }

  function handleGenderChange(next: Gender) {
    setGender(next);
    setSubLevel(subLevelsFor(level, next)[0]);
  }

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    const result = await addTeamAction(new FormData(e.currentTarget));
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setAdding(false);
    router.refresh();
  }

  async function handleRemove(teamId: string) {
    if (removingId) return;
    setRemovingId(teamId);
    await deleteTeamAction(teamId);
    setRemovingId(null);
    router.refresh();
  }

  return (
    <Card className="space-y-2.5 p-3.5">
      <div className="flex items-center justify-between border-b border-rule pb-2">
        <h2 className="font-display text-sm font-bold text-ink">Your Teams</h2>
        {teams.length < MAX_TEAMS && !adding && (
          <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
            + Add Team
          </Button>
        )}
      </div>

      {teams.length === 0 && !adding && (
        <p className="text-[12px] text-muted">
          Add up to {MAX_TEAMS} teams you coach so other coaches know who they&apos;d be playing against.
        </p>
      )}

      {teams.map((t) => (
        <div key={t.id} className="flex items-center justify-between gap-2 rounded-control border border-rule bg-paper px-3 py-2">
          <div>
            <p className="text-[13px] font-bold text-ink">{t.teamName}</p>
            <p className="text-[11px] text-muted">
              {genderToDisplay(t.gender)} {t.ageGroup} · {levelToDisplay(t.level)} · {t.subLevel}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleRemove(t.id)} disabled={removingId === t.id}>
            {removingId === t.id ? "Removing…" : "Remove"}
          </Button>
        </div>
      ))}

      {adding && (
        <form onSubmit={handleAdd} className="space-y-2 border-t border-rule pt-2.5">
          {error && <p className="text-[12px] font-semibold text-crit">{error}</p>}
          <Field label="Team name" htmlFor="team-teamName">
            <Input id="team-teamName" name="teamName" placeholder="e.g. Irvine Strikers U14B" required />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Gender" htmlFor="team-gender">
              <Select id="team-gender" name="gender" value={gender} onChange={(e) => handleGenderChange(e.target.value as Gender)}>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
              </Select>
            </Field>
            <Field label="Age group" htmlFor="team-ageGroup">
              <Select id="team-ageGroup" name="ageGroup" defaultValue={ageGroups[0]}>
                {ageGroups.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Level" htmlFor="team-level">
              <Select id="team-level" name="level" value={level} onChange={(e) => handleLevelChange(e.target.value as Level)}>
                <option value="Club">Club</option>
                <option value="High School">High School</option>
                <option value="Rec">Rec</option>
              </Select>
            </Field>
            <Field label="Competition level" htmlFor="team-subLevel">
              <Select id="team-subLevel" name="subLevel" value={subLevel} onChange={(e) => setSubLevel(e.target.value)}>
                {subLevelsFor(level, gender).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1 normal-case" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" className="flex-[2]" disabled={saving}>
              {saving ? "Saving…" : "Add Team"}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
