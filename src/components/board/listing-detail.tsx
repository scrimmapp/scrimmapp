"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ConnectDialog } from "@/components/board/connect-dialog";
import { useAppData } from "@/lib/app-data";
import { formatDate } from "@/lib/format";

export function ListingDetail({ id }: { id: string }) {
  const { listings, commentsFor, addComment } = useAppData();
  const listing = listings.find((l) => l.id === id);
  const [connectOpen, setConnectOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const showToast = useToast();

  if (!listing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="font-display text-xl font-bold text-ink">Listing not found</p>
        <p className="mt-2 text-sm text-ink-2">It may have been cancelled or the link is out of date.</p>
        <Link href="/board">
          <Button variant="primary" className="mt-6">Back to the board</Button>
        </Link>
      </div>
    );
  }

  const postComments = commentsFor(listing.id);

  function handleComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.trim() || !listing) return;
    addComment(listing.id, draft.trim());
    setDraft("");
    showToast("Comment posted");
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-2.5 px-4 py-3">
      <Link href="/board" className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-2 transition-colors hover:text-pitch">
        ← Back to marketplace board
      </Link>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="space-y-3 p-3.5 lg:col-span-2 md:p-4">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule pb-2.5">
            <div>
              <Badge tone="pitch">{listing.level} · {listing.subLevel}</Badge>
              <h1 className="mt-1 font-display text-xl font-extrabold tracking-tight text-ink md:text-2xl">
                {listing.teamName}
              </h1>
              <p className="mt-0.5 text-[12px] text-muted">Posted on the ScrimmApp board</p>
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="rounded-control border border-rule-2 bg-paper px-2 py-1 text-[12px] font-bold text-ink-2 transition-colors hover:bg-surface-2"
            >
              Share link
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[12px] md:grid-cols-3">
            <Stat label="Gender & age" value={`${listing.gender} (${listing.age})`} />
            <Stat label="Kickoff date" value={formatDate(listing.date)} />
            <Stat label="Time window" value={listing.time} />
            <Stat label="Travel radius" value={listing.travelRadius} accent />
            <Stat label="Referee fee" value={listing.refFee} />
            <Stat label="Pitch status" value={listing.isHosting ? "Host pitch secured" : "Open to location"} />
          </div>

          {listing.notes && (
            <div className="rounded-control border border-rule bg-paper p-2.5 text-[13px] text-ink-2">
              {listing.notes}
            </div>
          )}

          <div className="space-y-1 rounded-card border border-rule bg-paper p-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted">Venue & navigation</h4>
            <p className="text-[13px] font-bold text-ink">{listing.location}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-control bg-pitch-bg px-2 py-1 text-[12px] font-bold text-pitch-ink transition-colors hover:brightness-95"
            >
              Open Google Maps navigation →
            </a>
          </div>

          <Button variant="accent" size="lg" className="w-full" onClick={() => setConnectOpen(true)}>
            Send Quick Response Inquiry
          </Button>
        </Card>

        <Card className="flex flex-col justify-between gap-2.5 p-3.5">
          <div>
            <h3 className="mb-2 border-b border-rule pb-2 font-display text-base font-bold text-ink">
              Pitch-Side Discussion
            </h3>
            <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {postComments.length === 0 ? (
                <p className="text-[12px] italic text-muted">
                  No public messages yet. Ask about jersey colors or match format here.
                </p>
              ) : (
                <AnimatePresence initial={false}>
                  {postComments.map((c) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 26 }}
                      className="rounded-control border border-rule bg-paper p-2 text-[12px]"
                    >
                      <p className="leading-relaxed text-ink-2">{c.text}</p>
                      <span className="mt-1 block text-[10px] font-bold text-muted">
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          <form onSubmit={handleComment} className="space-y-1.5 border-t border-rule pt-2">
            <Textarea
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a public message..."
            />
            <Button type="submit" variant="secondary" className="w-full normal-case">
              Post discussion comment
            </Button>
          </form>
        </Card>
      </div>

      <ConnectDialog listing={listing} open={connectOpen} onClose={() => setConnectOpen(false)} />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-control border border-rule bg-paper p-2">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">{label}</span>
      <span className={`text-[13px] font-bold ${accent ? "text-pitch" : "text-ink"}`}>{value}</span>
    </div>
  );
}
