"use client";

import { useState, type FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Select, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitFeedbackAction } from "@/lib/actions/feedback";

const categoryOptions = [
  { value: "issue", label: "Report an Issue", hint: "Something isn't working, bugs, login errors" },
  { value: "improvement", label: "Suggest an Improvement", hint: "Feature requests, filters, tools" },
  { value: "general", label: "Give General Feedback", hint: "Thoughts on the platform, match experience" },
] as const;

export function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [category, setCategory] = useState<(typeof categoryOptions)[number]["value"]>("issue");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    const result = await submitFeedbackAction(category, message, contactEmail);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
    setMessage("");
    setContactEmail("");
  }

  function handleClose() {
    setSent(false);
    setError(null);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Send Feedback">
      {sent ? (
        <div className="space-y-3 text-center">
          <p className="text-[13px] font-semibold text-good">Thanks, that&apos;s on its way to the team.</p>
          <Button type="button" variant="secondary" className="w-full" onClick={handleClose}>
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {error && <p className="text-[12px] font-semibold text-crit">{error}</p>}

          <Field label="What's this about?" htmlFor="feedback-category">
            <Select
              id="feedback-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
            >
              {categoryOptions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </Field>
          <p className="text-[11px] text-muted">
            {categoryOptions.find((c) => c.value === category)?.hint}
          </p>

          <Field label="Your message" htmlFor="feedback-message">
            <Textarea
              id="feedback-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's going on."
              required
            />
          </Field>

          <Field label="Email (optional, if you'd like a reply)" htmlFor="feedback-email">
            <Input
              id="feedback-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="coach@yourclub.com"
            />
          </Field>

          <Button type="submit" variant="accent" className="w-full" disabled={saving}>
            {saving ? "Sending…" : "Send Feedback"}
          </Button>
        </form>
      )}
    </Dialog>
  );
}
