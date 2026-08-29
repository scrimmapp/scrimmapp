"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea, Checkbox } from "@/components/ui/input";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { Button } from "@/components/ui/button";
import { createListingAction } from "@/lib/actions/listings";
import { ageGroups, refFeeOptions, subLevelsFor, timeWindowOptions, travelRadiusOptions } from "@/lib/taxonomy";
import type { Gender, Level } from "@/lib/types";

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function PostListingForm() {
  const [level, setLevel] = useState<Level>("Club");
  const [gender, setGender] = useState<Gender>("Boys");
  const [subLevel, setSubLevel] = useState(subLevelsFor("Club", "Boys")[0]);
  const [justPosted, setJustPosted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleLevelChange(next: Level) {
    setLevel(next);
    setSubLevel(subLevelsFor(next, gender)[0]);
  }

  function handleGenderChange(next: Gender) {
    setGender(next);
    setSubLevel(subLevelsFor(level, next)[0]);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const teamName = String(formData.get("teamName") || "").trim();

    setSubmitting(true);
    setError(null);
    const result = await createListingAction(formData);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setJustPosted(teamName);
    form.reset();
    setLevel("Club");
    setGender("Boys");
    setSubLevel(subLevelsFor("Club", "Boys")[0]);
    setTimeout(() => setJustPosted(null), 5000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
    <Card className="relative mx-auto max-w-3xl overflow-hidden p-3.5 md:p-4">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-pitch/10 blur-3xl" />

      <div className="mb-1.5 text-center">
        <span className="inline-flex rounded-pill border border-pitch/25 bg-pitch-bg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-pitch-ink">
          Organize a match
        </span>
        <h2 className="mt-1 font-display text-lg font-extrabold tracking-tight text-ink">
          Post a Scrimmage Request
        </h2>
      </div>

      <AnimatePresence>
        {justPosted && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 overflow-hidden rounded-control border border-good/30 bg-good-bg px-3 py-1.5 text-[13px] font-semibold text-good"
          >
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
              className="flex shrink-0"
            >
              <CheckCircle2 size={14} strokeWidth={2.5} />
            </motion.span>
            Published. {justPosted} is now live on the board.
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 overflow-hidden rounded-control border border-crit/30 bg-crit-bg px-3 py-1.5 text-[13px] font-semibold text-crit"
          >
            <AlertCircle size={14} strokeWidth={2.5} className="shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <Field label="Team name & club" htmlFor="teamName">
            <Input id="teamName" name="teamName" placeholder="e.g. Irvine Strikers FC" required />
          </Field>
          <Field label="League level" htmlFor="level">
            <Select id="level" name="level" value={level} onChange={(e) => handleLevelChange(e.target.value as Level)}>
              <option value="Club">Club Soccer</option>
              <option value="High School">High School Program</option>
              <option value="Rec">Recreational / AYSO</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
          <Field label="Gender" htmlFor="gender">
            <Select id="gender" name="gender" value={gender} onChange={(e) => handleGenderChange(e.target.value as Gender)}>
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
            </Select>
          </Field>
          <Field label="Age group" htmlFor="age">
            <Select id="age" name="age" defaultValue="U14">
              {ageGroups.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Select>
          </Field>
          <Field label="Sub-tier / division" htmlFor="subLevel">
            <Select id="subLevel" name="subLevel" value={subLevel} onChange={(e) => setSubLevel(e.target.value)}>
              {subLevelsFor(level, gender).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
          <Field label="Preferred date" htmlFor="date">
            <Input id="date" name="date" type="date" defaultValue={tomorrowISO()} required />
          </Field>
          <Field label="Time window" htmlFor="time">
            <Select id="time" name="time" defaultValue="Morning">
              {timeWindowOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Willing to travel" htmlFor="travelRadius">
            <Select id="travelRadius" name="travelRadius" defaultValue="Up to 25 miles">
              {travelRadiusOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <Field label="Pitch location / city" htmlFor="location">
            <LocationAutocomplete name="location" placeholder="Start typing an address, e.g. Great Park, Irvine CA" required />
          </Field>
          <Field label="Referee fee allocation" htmlFor="refFee">
            <Select id="refFee" name="refFee" defaultValue="50/50 Split">
              {refFeeOptions.map((r) => (
                <option key={r} value={r}>{r === "Host Pays Ref" ? "Host Pays Official" : r === "Visitor Pays" ? "Visitor Pays Official" : r}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <Field label="Field # / Notes (optional)" htmlFor="notes">
            <Textarea id="notes" name="notes" rows={2} placeholder="e.g. Field 14, park in Lot 4. Match format, expectations, etc." />
          </Field>
          <div className="flex flex-col justify-center gap-2 rounded-control border border-rule bg-paper p-2.5">
            <label className="flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-ink-2">
              <Checkbox name="isHosting" defaultChecked />
              We have field time secured (hosting)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-ink-2">
              <Checkbox name="hasFieldFee" />
              Requires field rental fee share
            </label>
          </div>
        </div>

        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Publishing…" : "Publish Marketplace Listing"}
        </Button>
      </form>
    </Card>
    </motion.div>
  );
}
