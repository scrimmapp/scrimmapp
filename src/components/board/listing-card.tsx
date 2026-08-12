"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConnectDialog } from "@/components/board/connect-dialog";
import type { Listing } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function ListingCard({ listing }: { listing: Listing }) {
  const [connectOpen, setConnectOpen] = useState(false);

  return (
    <>
      <Card className="group flex flex-col justify-between p-4 transition-all hover:-translate-y-0.5 hover:border-pitch/40 hover:shadow-md">
        <Link href={`/listings/${listing.id}`} className="flex flex-1 flex-col">
          <div className="mb-2.5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-display text-base font-bold leading-tight text-ink transition-colors group-hover:text-pitch">
                {listing.teamName}
              </h3>
              <p className="mt-0.5 truncate text-[11px] font-semibold text-muted">📍 {listing.location}</p>
            </div>
            <Badge tone={listing.gender === "Girls" ? "gold" : "pitch"} className="shrink-0">
              {listing.gender} {listing.age}
            </Badge>
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            <Badge tone="muted">
              {listing.level} · {listing.subLevel}
            </Badge>
            <Badge tone="pitch">{listing.travelRadius}</Badge>
          </div>

          <div className="space-y-1 rounded-control border border-rule bg-paper p-2.5 text-[11px]">
            <Row label="Kickoff" value={`${formatDate(listing.date)} · ${listing.time}`} />
            <Row
              label="Field time"
              value={listing.isHosting ? "Host pitch secured" : "Needs pitch"}
              tone={listing.isHosting ? "good" : "warn"}
            />
            <Row label="Official fee" value={listing.refFee} />
          </div>
        </Link>

        <Button
          variant="primary"
          size="sm"
          className="mt-3 w-full"
          onClick={(e) => {
            e.preventDefault();
            setConnectOpen(true);
          }}
        >
          Connect / Inquire
        </Button>
      </Card>

      <ConnectDialog listing={listing} open={connectOpen} onClose={() => setConnectOpen(false)} />
    </>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-semibold text-muted">{label}</span>
      <span
        className={
          tone === "good" ? "font-bold text-good" : tone === "warn" ? "font-bold text-warn" : "font-bold text-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}
