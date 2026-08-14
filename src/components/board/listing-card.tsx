"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConnectDialog } from "@/components/board/connect-dialog";
import type { Listing } from "@/lib/types";
import { formatDate } from "@/lib/format";

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export function ListingCard({ listing }: { listing: Listing }) {
  const [connectOpen, setConnectOpen] = useState(false);

  return (
    <>
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 24 } }}
        className="group flex flex-col justify-between rounded-card border border-rule bg-surface p-3.5 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-pitch/35 hover:shadow-md"
      >
        <Link href={`/listings/${listing.id}`} className="flex flex-1 flex-col">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-display text-sm font-bold leading-tight text-ink transition-colors group-hover:text-pitch">
                {listing.teamName}
              </h3>
              <p className="mt-0.5 flex items-center gap-0.5 truncate text-[10px] font-semibold text-muted">
                <MapPin size={10} className="shrink-0" strokeWidth={2.5} />
                <span className="truncate">{listing.location}</span>
              </p>
            </div>
            <Badge tone={listing.gender === "Girls" ? "gold" : "pitch"} className="shrink-0">
              {listing.gender} {listing.age}
            </Badge>
          </div>

          <div className="mb-2.5 flex flex-wrap gap-1">
            <Badge tone="muted">
              {listing.level} · {listing.subLevel}
            </Badge>
            <Badge tone="pitch">{listing.travelRadius}</Badge>
          </div>

          <div className="space-y-1 rounded-control border border-rule bg-paper p-2 text-[10px]">
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
      </motion.div>

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
