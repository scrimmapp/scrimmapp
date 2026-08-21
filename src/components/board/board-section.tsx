"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Select, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/board/listing-card";
import { useRealtimeInsert } from "@/lib/supabase/use-realtime-insert";
import { useRealtimeUpdate } from "@/lib/supabase/use-realtime-update";
import { camelizeKeys, listingToDisplay } from "@/db/mappers";
import { travelRadiusOptions } from "@/lib/taxonomy";
import type { Listing } from "@/lib/types";
import type { listings as listingsTable } from "@/db/schema";

type Filters = { gender: string; level: string; radius: string; search: string };
const defaultFilters: Filters = { gender: "All", level: "All", radius: "All", search: "" };

export function BoardSection({
  initialListings,
  currentUserId,
}: {
  initialListings: Listing[];
  currentUserId?: string | null;
}) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const onInsert = useCallback((raw: Record<string, unknown>) => {
    if (raw.status !== "open") return;
    const row = camelizeKeys<typeof listingsTable.$inferSelect>(raw);
    row.createdAt = new Date(row.createdAt as unknown as string);
    const mapped = listingToDisplay(row);
    setListings((prev) => (prev.some((l) => l.id === mapped.id) ? prev : [mapped, ...prev]));
  }, []);
  useRealtimeInsert<Record<string, unknown>>("listings", undefined, onInsert);

  // A cancel (status -> cancelled) drops the card for every viewer; an edit patches it in
  // place. Covers both the actor's own tab and everyone else's, no manual local bookkeeping
  // needed on top of what post/cancel/edit already trigger server-side.
  const onUpdate = useCallback((raw: Record<string, unknown>) => {
    const row = camelizeKeys<typeof listingsTable.$inferSelect>(raw);
    row.createdAt = new Date(row.createdAt as unknown as string);
    const mapped = listingToDisplay(row);
    setListings((prev) => {
      if (mapped.status !== "open") return prev.filter((l) => l.id !== mapped.id);
      const exists = prev.some((l) => l.id === mapped.id);
      return exists ? prev.map((l) => (l.id === mapped.id ? mapped : l)) : [mapped, ...prev];
    });
  }, []);
  useRealtimeUpdate<Record<string, unknown>>("listings", undefined, onUpdate);

  const filtered = useMemo(() => {
    return listings.filter((s) => {
      const matchesGender = filters.gender === "All" || s.gender === filters.gender;
      const matchesLevel = filters.level === "All" || s.level === filters.level;
      const matchesRadius = filters.radius === "All" || s.travelRadius === filters.radius;
      const q = filters.search.toLowerCase();
      const matchesSearch =
        !q || s.teamName.toLowerCase().includes(q) || s.location.toLowerCase().includes(q);
      return matchesGender && matchesLevel && matchesRadius && matchesSearch;
    });
  }, [listings, filters]);

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2.5 border-b border-rule pb-2.5 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-ink">Active Scrimmage Board</h3>
          <p className="text-[12px] text-ink-2">Connect directly with coaches looking for matches.</p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
          <Input
            placeholder="Search team or city..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full sm:w-48"
          />
          <Select
            value={filters.gender}
            onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))}
            className="w-auto"
          >
            <option value="All">All genders</option>
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
          </Select>
          <Select
            value={filters.level}
            onChange={(e) => setFilters((f) => ({ ...f, level: e.target.value }))}
            className="w-auto"
          >
            <option value="All">All levels</option>
            <option value="Club">Club</option>
            <option value="High School">High School</option>
            <option value="Rec">Rec</option>
          </Select>
          <Select
            value={filters.radius}
            onChange={(e) => setFilters((f) => ({ ...f, radius: e.target.value }))}
            className="w-auto"
          >
            <option value="All">All travel radii</option>
            {travelRadiusOptions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-card border border-dashed border-rule-2 bg-surface py-16 text-center"
          >
            <p className="text-base font-semibold text-ink-2">No scrimmages match your filter criteria.</p>
            <Button variant="secondary" size="sm" className="mt-3 normal-case" onClick={() => setFilters(defaultFilters)}>
              Clear all filters
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key={filtered.map((l) => l.id).join(",")}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} currentUserId={currentUserId} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
