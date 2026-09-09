"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const DISMISS_KEY = "scrimmapp_onboarding_nudge_dismissed";

const DISMISS_EVENT = "scrimmapp:onboarding-dismissed";

function subscribe(callback: () => void) {
  window.addEventListener(DISMISS_EVENT, callback);
  return () => window.removeEventListener(DISMISS_EVENT, callback);
}

function getSnapshot() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

// The server has no sessionStorage, so it always renders as not-dismissed. useSyncExternalStore
// (unlike reading this inside useState's initializer) reconciles that with the client's real
// value without a hydration mismatch: React knows to use this on the server/first pass and the
// real getSnapshot() once hydrated.
function getServerSnapshot() {
  return false;
}

export function OnboardingNudge() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (dismissed) return null;

  function handleDismiss() {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
      // The native "storage" event only fires in *other* tabs, never the one that wrote the
      // value, so this tab needs its own signal to make useSyncExternalStore re-read and hide.
      window.dispatchEvent(new Event(DISMISS_EVENT));
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
