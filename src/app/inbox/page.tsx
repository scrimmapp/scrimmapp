"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useAppData } from "@/lib/app-data";

export default function InboxPage() {
  const { inbox, markInboxRead } = useAppData();

  useEffect(() => {
    markInboxRead();
  }, [markInboxRead]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3 px-4 py-4">
      <div className="border-b border-rule pb-2">
        <h1 className="font-display text-lg font-extrabold tracking-tight text-ink md:text-xl">Coach Communications Inbox</h1>
        <p className="mt-0.5 text-[13px] text-ink-2">Direct inquiries from opposing coaches.</p>
      </div>

      {inbox.length === 0 ? (
        <Card className="p-6 text-center text-[13px] font-semibold text-muted">
          Your inbox is empty. Publish a scrimmage on the board to receive inquiries.
        </Card>
      ) : (
        <div className="space-y-2.5">
          {inbox.map((m) => (
            <Card key={m.id} className="border-l-4 border-l-pitch p-3">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pitch">
                  From: {m.senderTeamName}
                </span>
                <span className="shrink-0 text-[10px] font-semibold text-muted">
                  {new Date(m.timestamp).toLocaleDateString()}
                </span>
              </div>
              <h4 className="mt-1 font-display text-sm font-bold text-ink">{m.subject}</h4>
              <p className="mt-1 rounded-control border border-rule bg-paper p-2 text-[12px] leading-relaxed text-ink-2">
                {m.body}
              </p>
              {m.listingId && (
                <Link
                  href={`/listings/${m.listingId}`}
                  className="mt-1 inline-block text-[12px] font-bold text-pitch hover:underline"
                >
                  View listing →
                </Link>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
