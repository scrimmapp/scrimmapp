"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const DISMISS_KEY = "scrimmapp_onboarding_nudge_dismissed";

export function OnboardingNudge() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Ignore: worst case the nudge reappears next session, not worth failing over.
    }
  }

  return (
    <div className="mx-auto mb-2 flex w-full max-w-6xl items-center justify-between gap-3 rounded-control border border-gold/30 bg-gold-bg px-3 py-2 text-[12px] font-semibold text-gold-ink">
      <span>
        Add your team(s) to your profile so other coaches know who they&apos;d be playing.{" "}
        <Link href="/profile" className="underline">
          Complete your profile →
        </Link>
      </span>
      <button type="button" onClick={handleDismiss} aria-label="Dismiss" className="shrink-0 text-gold-ink/70 hover:text-gold-ink">
        <X size={14} />
      </button>
    </div>
  );
}
