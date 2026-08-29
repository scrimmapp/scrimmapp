"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditListingDialog } from "@/components/board/edit-listing-dialog";
import { CancelListingDialog } from "@/components/board/cancel-listing-dialog";
import { ConfirmMatchDialog, type Inquirer } from "@/components/posts/confirm-match-dialog";
import { RateOpponentDialog } from "@/components/posts/rate-opponent-dialog";
import { completeListingAction } from "@/lib/actions/listings";
import { formatDate } from "@/lib/format";
import { useRouter } from "next/navigation";
import type { Listing } from "@/lib/types";

export interface PostItem {
  listing: Listing;
  inquirers: Inquirer[];
  opponentTeamName?: string;
  connectionId?: string;
  alreadyRated?: boolean;
}

const statusLabel: Record<Listing["status"], string> = {
  open: "Open",
  matched: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusTone: Record<Listing["status"], "pitch" | "gold" | "muted" | "crit"> = {
  open: "pitch",
  matched: "gold",
  completed: "muted",
  cancelled: "crit",
};

function PostCard({ item }: { item: PostItem }) {
  const router = useRouter();
  const { listing } = item;
  const [editing, setEditing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [rating, setRating] = useState(false);
  const [completing, setCompleting] = useState(false);

  async function handleComplete() {
    if (completing) return;
    setCompleting(true);
    await completeListingAction(listing.id);
    setCompleting(false);
    router.refresh();
  }

  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-sm font-bold text-ink">{listing.teamName}</h3>
            <Badge tone={statusTone[listing.status]}>{statusLabel[listing.status]}</Badge>
          </div>
          <p className="mt-0.5 text-[12px] text-ink-2">
            {formatDate(listing.date)} · {listing.gender} {listing.age} · {listing.subLevel}
          </p>
          <p className="text-[12px] text-muted">{listing.location}</p>
          {item.opponentTeamName && (
            <p className="mt-1 text-[12px] font-semibold text-pitch">
              {listing.status === "completed" ? "Played" : "Confirmed"} vs. {item.opponentTeamName}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {listing.status === "open" && (
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setConfirming(true)}>
              Confirm Match
            </Button>
            <Button variant="danger" size="sm" onClick={() => setCancelling(true)}>
              Cancel
            </Button>
          </>
        )}
        {listing.status === "matched" && (
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button variant="accent" size="sm" onClick={handleComplete} disabled={completing}>
              {completing ? "Marking…" : "Mark Completed"}
            </Button>
            <Button variant="danger" size="sm" onClick={() => setCancelling(true)}>
              Cancel
            </Button>
          </>
        )}
        {listing.status === "completed" && item.connectionId && !item.alreadyRated && (
          <Button variant="accent" size="sm" onClick={() => setRating(true)}>
            Rate Opponent
          </Button>
        )}
        {listing.status === "completed" && item.alreadyRated && (
          <span className="text-[12px] font-semibold text-good">Rated ✓</span>
        )}
      </div>

      <EditListingDialog listing={listing} open={editing} onClose={() => setEditing(false)} />
      <CancelListingDialog listingId={listing.id} open={cancelling} onClose={() => setCancelling(false)} />
      <ConfirmMatchDialog
        listingId={listing.id}
        inquirers={item.inquirers}
        open={confirming}
        onClose={() => setConfirming(false)}
      />
      {item.connectionId && (
        <RateOpponentDialog
          connectionId={item.connectionId}
          opponentTeamName={item.opponentTeamName ?? "your opponent"}
          open={rating}
          onClose={() => setRating(false)}
        />
      )}
    </Card>
  );
}

export function PostsSection({ items }: { items: PostItem[] }) {
  if (items.length === 0) {
    return (
      <Card className="p-6 text-center text-[13px] font-semibold text-muted">
        You haven&apos;t posted any scrimmages yet. Head to the board to post your first one.
      </Card>
    );
  }

  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <PostCard key={item.listing.id} item={item} />
      ))}
    </div>
  );
}
