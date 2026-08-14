"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "@/components/logo";
import { AmbientBlobs } from "@/components/ui/ambient-blobs";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  status,
  onSubmit,
  submitLabel,
  submittingLabel,
  footerText,
  footerLinkLabel,
  footerLinkHref,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  status: "idle" | "submitting" | "success";
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  submittingLabel: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
}) {
  return (
    <div className="relative flex items-center justify-center overflow-hidden px-4 py-5">
      <AmbientBlobs />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm rounded-card border border-rule bg-surface/90 p-5 shadow-lg backdrop-blur-xl"
      >
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 16 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-good-bg text-good"
              >
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path
                    d="M5 12.5l4.5 4.5L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
                  />
                </svg>
              </motion.div>
              <p className="font-display text-base font-bold text-ink">You&rsquo;re in!</p>
              <p className="text-[11px] text-ink-2">Taking you to your coach profile…</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-3.5 flex flex-col items-center text-center">
                <Logo size="md" showWordmark={false} className="mb-2" />
                <span className="inline-flex rounded-pill border border-pitch/25 bg-pitch-bg px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-pitch-ink">
                  {eyebrow}
                </span>
                <h1 className="mt-1.5 font-display text-base font-extrabold tracking-tight text-ink">{title}</h1>
                <p className="mt-0.5 text-[11px] text-ink-2">{subtitle}</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-2.5">
                {children}
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="mt-1 w-full"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        className="h-3 w-3 rounded-full border-2 border-gold-contrast/30 border-t-gold-contrast"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                      />
                      {submittingLabel}
                    </span>
                  ) : (
                    submitLabel
                  )}
                </Button>
              </form>

              <p className="mt-3 text-center text-[11px] text-ink-2">
                {footerText}{" "}
                <Link href={footerLinkHref} className="font-bold text-pitch hover:underline">
                  {footerLinkLabel}
                </Link>
              </p>
              <p className="mt-2 text-center text-[9px] uppercase tracking-wider text-muted">
                Preview only. Real accounts arrive in Sprint 2
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
