"use client";

import { Card } from "@/components/ui/card";
import { useAppData } from "@/lib/app-data";

export default function VenuesPage() {
  const { venues } = useAppData();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-3 px-4 py-4">
      <div className="border-b border-rule pb-2.5">
        <h1 className="font-display text-xl font-extrabold tracking-tight text-ink md:text-2xl">Saved Pitch Directory</h1>
        <p className="mt-0.5 text-xs text-ink-2">Verified venues with lighting and parking notes.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((v) => (
          <Card key={v.id} className="space-y-1.5 p-3.5">
            <h3 className="font-display text-base font-bold text-ink">{v.name}</h3>
            <p className="text-[11px] font-semibold text-muted">
              📍 {v.city} · {v.fields} · {v.lights ? "💡 Night lights" : "No lights"}
            </p>
            <p className="text-[11px] text-ink-2">Parking: {v.parking}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.name} ${v.city}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block pt-1 text-[11px] font-bold text-pitch hover:underline"
            >
              Google Maps directions →
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
