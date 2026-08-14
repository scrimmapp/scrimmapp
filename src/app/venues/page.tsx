"use client";

import { motion } from "motion/react";
import { MapPin, Lightbulb, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RevealGroup, revealItemVariants } from "@/components/ui/reveal";
import { useAppData } from "@/lib/app-data";
import { cn } from "@/lib/cn";

export default function VenuesPage() {
  const { venues } = useAppData();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-3 px-4 py-4">
      <div className="border-b border-rule pb-2">
        <h1 className="font-display text-base font-extrabold tracking-tight text-ink md:text-lg">Saved Pitch Directory</h1>
        <p className="mt-0.5 text-[11px] text-ink-2">Verified venues with lighting and parking notes.</p>
      </div>

      <RevealGroup className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((v) => (
          <motion.div
            key={v.id}
            variants={revealItemVariants}
            whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 24 } }}
          >
            <Card className="space-y-1 p-3 transition-shadow hover:shadow-md">
              <h3 className="font-display text-sm font-bold text-ink">{v.name}</h3>
              <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] font-semibold text-muted">
                <span className="flex items-center gap-0.5">
                  <MapPin size={10} strokeWidth={2.5} />
                  {v.city}
                </span>
                <span>· {v.fields} ·</span>
                <span className={cn("flex items-center gap-0.5", v.lights && "text-gold-ink")}>
                  <Lightbulb size={10} strokeWidth={2.5} />
                  {v.lights ? "Night lights" : "No lights"}
                </span>
              </p>
              <p className="text-[10px] text-ink-2">Parking: {v.parking}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.name} ${v.city}`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 pt-0.5 text-[10px] font-bold text-pitch hover:underline"
              >
                Google Maps directions
                <ArrowUpRight size={11} strokeWidth={2.5} />
              </a>
            </Card>
          </motion.div>
        ))}
      </RevealGroup>
    </div>
  );
}
