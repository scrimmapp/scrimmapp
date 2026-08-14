"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea, Checkbox } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data";
import { ageGroups, refFeeOptions, subLevelsByLevel, timeWindowOptions, travelRadiusOptions } from "@/lib/taxonomy";
import type { Gender, Level, RefFee, TimeWindow, TravelRadius } from "@/lib/types";

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function PostListingForm() {
  const { addListing } = useAppData();
  const [level, setLevel] = useState<Level>("Club");
  const [subLevel, setSubLevel] = useState(subLevelsByLevel.Club[0]);
  const [justPosted, setJustPosted] = useState<string | null>(null);

  function handleLevelChange(next: Level) {
    setLevel(next);
    setSubLevel(subLevelsByLevel[next][0]);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const teamName = String(form.get("teamName") || "").trim();
    const location = String(form.get("location") || "").trim();
    const date = String(form.get("date") || "");

    if (!teamName || !location || !date) return;

    addListing({
      teamName,
      location,
      date,
      level,
      subLevel,
      gender: form.get("gender") as Gender,
      age: String(form.get("age")),
      time: form.get("time") as TimeWindow,
      travelRadius: form.get("travelRadius") as TravelRadius,
      refFee: form.get("refFee") as RefFee,
      isHosting: form.get("isHosting") === "on",
      hasRef: true,
      hasFieldFee: form.get("hasFieldFee") === "on",
      notes: String(form.get("notes") || "").trim() || undefined,
    });

    setJustPosted(teamName);
    e.currentTarget.reset();
    setLevel("Club");
    setSubLevel(subLevelsByLevel.Club[0]);
    setTimeout(() => setJustPosted(null), 5000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
    <Card className="relative mx-auto max-w-3xl overflow-hidden p-3 md:p-3.5">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-pitch/10 blur-3xl" />

      <div className="mb-1.5 text-center">
        <span className="inline-flex rounded-pill border border-pitch/25 bg-pitch-bg px-2 py-0.5 text-[7px] font-bold uppercase tracking-widest text-pitch-ink">
          Organize a match
        </span>
        <h2 className="mt-0.5 font-display text-sm font-extrabold tracking-tight text-ink">
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
            className="flex items-center gap-2 overflow-hidden rounded-control border border-good/30 bg-good-bg px-3 py-1.5 text-[11px] font-semibold text-good"
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
            <Select id="gender" name="gender" defaultValue="Boys">
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
              {subLevelsByLevel[level].map((s) => (
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
            <Input id="location" name="location" placeholder="e.g. Great Park Field 3, Irvine CA" required />
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
          <Field label="Notes (optional)" htmlFor="notes">
            <Textarea id="notes" name="notes" rows={2} placeholder="Match format, expectations, anything else opposing coaches should know..." />
          </Field>
          <div className="flex flex-col justify-center gap-2 rounded-control border border-rule bg-paper p-2.5">
            <label className="flex cursor-pointer items-center gap-2 text-[10px] font-semibold text-ink-2">
              <Checkbox name="isHosting" defaultChecked />
              We have field time secured (hosting)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[10px] font-semibold text-ink-2">
              <Checkbox name="hasFieldFee" />
              Requires field rental fee share
            </label>
          </div>
        </div>

        <Button type="submit" variant="accent" size="lg" className="w-full">
          Publish Marketplace Listing
        </Button>
      </form>
    </Card>
    </motion.div>
  );
}
