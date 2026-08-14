"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Reveal } from "@/components/ui/reveal";

const faqs = [
  {
    q: "How does the quick-connect inquiry work?",
    a: "Tap Connect on any listing to send a 1-tap quick phrase (for example, \"Is this match still available?\") straight to the host coach's inbox, or write a custom message.",
  },
  {
    q: "How does conflict detection work on the Season Calendar?",
    a: "If two events land on the same date and time window (Morning, Afternoon, or Evening), the calendar flags the day with a red conflict badge so you don't double-book your team.",
  },
  {
    q: "Can I edit or cancel a listing after posting it?",
    a: "Yes. From your Coach Profile you can manage active listings, including cancelling with a reason so opposing coaches understand what happened.",
  },
  {
    q: "Is my contact information public?",
    a: "No. Coaches connect through in-app inquiries first; direct contact details are only shared once you choose to share them.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-2 px-4 py-4">
      <h1 className="mb-0.5 text-center font-display text-lg font-extrabold tracking-tight text-ink md:text-xl">
        Frequently Asked Questions
      </h1>
      {faqs.map((f, i) => {
        const open = openIndex === i;
        return (
          <Reveal key={f.q} delay={i * 0.05}>
            <div className="overflow-hidden rounded-card border border-rule bg-surface">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-3 p-3 text-left"
              >
                <span className="font-display text-[13px] font-bold text-ink">{f.q}</span>
                <motion.span
                  animate={{ rotate: open ? 45 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 26 }}
                  className="flex h-4 w-4 shrink-0 items-center justify-center text-pitch"
                >
                  <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M6 1v10M1 6h10" />
                  </svg>
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-3 pb-3 text-[12px] leading-relaxed text-ink-2">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
