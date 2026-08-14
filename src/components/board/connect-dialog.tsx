"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useAppData } from "@/lib/app-data";
import type { Listing } from "@/lib/types";

const quickPhrases = [
  "Is this match still available?",
  "We can host at our pitch!",
  "We can travel to your location!",
  "We're ready to play, let's lock this in.",
];

export function ConnectDialog({
  listing,
  open,
  onClose,
}: {
  listing: Listing;
  open: boolean;
  onClose: () => void;
}) {
  const { sendInquiry } = useAppData();
  const [customMessage, setCustomMessage] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  function handleSend(message: string) {
    if (!message.trim()) return;
    sendInquiry(listing, message.trim());
    setSent(message.trim());
  }

  function handleClose() {
    setSent(null);
    setCustomMessage("");
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} title={`Connect with ${listing.teamName}`}>
      {sent ? (
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-good-bg text-good">
            <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10.5l4 4L16 6" />
            </svg>
          </div>
          <p className="text-[11px] text-ink-2">
            Your message <em className="text-ink">&ldquo;{sent}&rdquo;</em> was sent to{" "}
            <strong className="text-ink">{listing.teamName}</strong>. They&apos;ll see it in their inbox.
          </p>
          <Button variant="secondary" className="w-full normal-case" onClick={handleClose}>
            Close
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] text-ink-2">
            Tap a quick phrase to message <strong className="text-ink">{listing.teamName}</strong> instantly:
          </p>
          <motion.div
            className="flex flex-col gap-1.5"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          >
            {quickPhrases.map((phrase) => (
              <motion.button
                key={phrase}
                type="button"
                onClick={() => handleSend(phrase)}
                variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center justify-between rounded-control border border-rule-2 bg-paper px-3 py-2 text-left text-[11px] font-semibold text-ink-2 transition-colors hover:border-pitch/50 hover:bg-pitch-bg hover:text-pitch-ink"
              >
                <span>{phrase}</span>
                <span className="opacity-0 transition-opacity group-hover:opacity-100">→</span>
              </motion.button>
            ))}
          </motion.div>

          <div className="border-t border-rule pt-3">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-muted">
              Or write a custom message
            </p>
            <Textarea
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="e.g. We have 11v11 referees booked and ready..."
            />
            <Button
              variant="accent"
              className="mt-2 w-full"
              onClick={() => handleSend(customMessage)}
              disabled={!customMessage.trim()}
            >
              Send Message
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
