"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { ConnectDialog } from "@/components/board/connect-dialog";
import { useAppData } from "@/lib/app-data";
import { formatDate } from "@/lib/format";

export function ListingDetail({ id }: { id: string }) {
  const { listings, commentsFor, addComment } = useAppData();
  const listing = listings.find((l) => l.id === id);
  const [connectOpen, setConnectOpen] = useState(false);
  const [draft, setDraft] = useState("");

  if (!listing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="font-display text-2xl font-bold text-ink">Listing not found</p>
        <p className="mt-2 text-sm text-ink-2">It may have been cancelled or the link is out of date.</p>
        <Link href="/">
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
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-3 px-4 py-4">
      <Link href="/" className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-2 transition-colors hover:text-pitch">
        ← Back to marketplace board
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="space-y-4 p-4 lg:col-span-2 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule pb-3">
            <div>
              <Badge tone="pitch">{listing.level} · {listing.subLevel}</Badge>
              <h1 className="mt-1.5 font-display text-xl font-extrabold tracking-tight text-ink md:text-2xl">
                {listing.teamName}
              </h1>
              <p className="mt-0.5 text-[11px] text-muted">Posted on the ScrimmApp board</p>
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="rounded-control border border-rule-2 bg-paper px-2.5 py-1.5 text-[11px] font-bold text-ink-2 transition-colors hover:bg-surface-2"
            >
              Share link
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-[11px] md:grid-cols-3">
            <Stat label="Gender & age" value={`${listing.gender} (${listing.age})`} />
            <Stat label="Kickoff date" value={formatDate(listing.date)} />
            <Stat label="Time window" value={listing.time} />
            <Stat label="Travel radius" value={listing.travelRadius} accent />
            <Stat label="Referee fee" value={listing.refFee} />
            <Stat label="Pitch status" value={listing.isHosting ? "Host pitch secured" : "Open to location"} />
          </div>

          {listing.notes && (
            <div className="rounded-control border border-rule bg-paper p-3 text-xs text-ink-2">
              {listing.notes}
            </div>
          )}

          <div className="space-y-1.5 rounded-card border border-rule bg-paper p-3">
            <h4 className="text-[9px] font-bold uppercase tracking-wider text-muted">Venue & navigation</h4>
            <p className="text-xs font-bold text-ink">{listing.location}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-control bg-pitch-bg px-2.5 py-1 text-[11px] font-bold text-pitch-ink transition-colors hover:brightness-95"
            >
              Open Google Maps navigation →
            </a>
          </div>

          <Button variant="accent" size="lg" className="w-full" onClick={() => setConnectOpen(true)}>
            Send Quick Response Inquiry
          </Button>
        </Card>

        <Card className="flex flex-col justify-between gap-3 p-4">
          <div>
            <h3 className="mb-2.5 border-b border-rule pb-2.5 font-display text-base font-bold text-ink">
              Pitch-Side Discussion
            </h3>
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {postComments.length === 0 ? (
                <p className="text-[11px] italic text-muted">
                  No public messages yet. Ask about jersey colors or match format here.
                </p>
              ) : (
                postComments.map((c) => (
                  <div key={c.id} className="rounded-control border border-rule bg-paper p-2.5 text-[11px]">
                    <p className="leading-relaxed text-ink-2">{c.text}</p>
                    <span className="mt-1 block text-[9px] font-bold text-muted">
                      {new Date(c.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleComment} className="space-y-2 border-t border-rule pt-2.5">
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
    <div className="rounded-control border border-rule bg-paper p-2.5">
      <span className="block text-[9px] font-bold uppercase tracking-wider text-muted">{label}</span>
      <span className={`text-xs font-bold ${accent ? "text-pitch" : "text-ink"}`}>{value}</span>
    </div>
  );
}
