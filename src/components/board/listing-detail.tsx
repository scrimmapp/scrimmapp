"use client";

import { useCallback, useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ConnectDialog } from "@/components/board/connect-dialog";
import { EditListingDialog } from "@/components/board/edit-listing-dialog";
import { CancelListingDialog } from "@/components/board/cancel-listing-dialog";
import { addCommentAction, deleteCommentAction } from "@/lib/actions/comments";
import { useRealtimeInsert } from "@/lib/supabase/use-realtime-insert";
import { formatDate } from "@/lib/format";
import type { Comment, Listing } from "@/lib/types";

const statusBadge: Record<Listing["status"], { label: string; tone: "good" | "warn" | "crit" } | null> = {
  open: null,
  matched: { label: "Matched", tone: "warn" },
  cancelled: { label: "Cancelled", tone: "crit" },
  completed: { label: "Completed", tone: "good" },
};

export function ListingDetail({
  listing,
  comments: initialComments,
  currentUserId,
}: {
  listing: Listing | null;
  comments: Comment[];
  currentUserId: string | null;
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [connectOpen, setConnectOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const showToast = useToast();
  const isOwner = !!listing && currentUserId === listing.ownerId;

  // Realtime delivers the raw Postgres row (snake_case column names, ISO date strings), not
  // a Drizzle-shaped row, so fields are read directly here rather than through a mapper.
  const onInsert = useCallback((raw: Record<string, unknown>) => {
    if (!listing || raw.listing_id !== listing.id) return;
    const id = raw.id as string;
    setComments((prev) =>
      prev.some((c) => c.id === id)
        ? prev
        : [
            ...prev,
            {
              id,
              listingId: raw.listing_id as string,
              authorId: raw.author_id as string,
              text: raw.body as string,
              timestamp: new Date(raw.created_at as string).getTime(),
            },
          ],
    );
  }, [listing]);
  useRealtimeInsert<Record<string, unknown>>(
    "comments",
    listing ? `listing_id=eq.${listing.id}` : undefined,
    onInsert,
  );

  async function handleDeleteComment(commentId: string) {
    if (!listing) return;
    const result = await deleteCommentAction(commentId, listing.id);
    if (result.error) {
      showToast(result.error);
      return;
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

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

  async function handleComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.trim() || posting || !listing) return;
    setPosting(true);
    const result = await addCommentAction(listing.id, draft.trim());
    setPosting(false);
    if (result.error) {
      showToast(result.error);
      return;
    }
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
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone="pitch">{listing.level} · {listing.subLevel}</Badge>
                {isOwner && <Badge tone="good">Your listing</Badge>}
                {statusBadge[listing.status] && (
                  <Badge tone={statusBadge[listing.status]!.tone}>{statusBadge[listing.status]!.label}</Badge>
                )}
              </div>
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
            {listing.homeColor && <Stat label="Home uniform" value={listing.homeColor} />}
            {listing.awayColor && <Stat label="Away uniform" value={listing.awayColor} />}
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

          {isOwner ? (
            <div className="flex gap-2">
              <Button variant="secondary" size="lg" className="flex-1 normal-case" onClick={() => setEditOpen(true)}>
                Edit listing
              </Button>
              {listing.status !== "cancelled" && (
                <Button variant="danger" size="lg" className="flex-1 normal-case" onClick={() => setCancelOpen(true)}>
                  Cancel listing
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={() => setConnectOpen(true)}
              disabled={listing.status === "cancelled"}
            >
              {listing.status === "cancelled" ? "This listing was cancelled" : "Send Quick Response Inquiry"}
            </Button>
          )}
        </Card>

        <Card className="flex flex-col justify-between gap-2.5 p-3.5">
          <div>
            <h3 className="mb-2 border-b border-rule pb-2 font-display text-base font-bold text-ink">
              Pitch-Side Discussion
            </h3>
            <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-[12px] italic text-muted">
                  No public messages yet. Ask about jersey colors or match format here.
                </p>
              ) : (
                <AnimatePresence initial={false}>
                  {comments.map((c) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 26 }}
                      className="rounded-control border border-rule bg-paper p-2 text-[12px]"
                    >
                      <p className="leading-relaxed text-ink-2">{c.text}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted">
                          {new Date(c.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {currentUserId === c.authorId && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-[10px] font-bold text-crit hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </div>
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
            <Button type="submit" variant="secondary" className="w-full normal-case" disabled={posting}>
              {posting ? "Posting…" : "Post discussion comment"}
            </Button>
          </form>
        </Card>
      </div>

      <ConnectDialog listing={listing} open={connectOpen} onClose={() => setConnectOpen(false)} />
      {isOwner && (
        <>
          <EditListingDialog listing={listing} open={editOpen} onClose={() => setEditOpen(false)} />
          <CancelListingDialog listingId={listing.id} open={cancelOpen} onClose={() => setCancelOpen(false)} />
        </>
      )}
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
