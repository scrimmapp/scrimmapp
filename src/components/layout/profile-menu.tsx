"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, UserRound } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";

export function ProfileMenu({ coach }: { coach: { name: string; initials: string; teamName: string } }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await signOutAction();
    // Hard navigation: see the comment in login/page.tsx for why router.push() isn't reliable here.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open profile menu"
        aria-expanded={open}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pitch text-[11px] font-black text-pitch-contrast shadow-sm transition-transform hover:scale-105 active:scale-95"
      >
        {coach.initials}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ type: "spring", stiffness: 460, damping: 32 }}
            className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-card border border-rule bg-surface shadow-lg"
          >
            <div className="border-b border-rule px-3 py-2.5">
              <p className="font-display text-[13px] font-bold text-ink">{coach.name}</p>
              <p className="text-[11px] text-muted">{coach.teamName}</p>
            </div>
            <div className="p-1.5">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-control px-2.5 py-2 text-[12px] font-semibold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <UserRound size={14} strokeWidth={2.2} />
                View profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-control px-2.5 py-2 text-left text-[12px] font-semibold text-crit transition-colors hover:bg-crit-bg"
              >
                <LogOut size={14} strokeWidth={2.2} />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
