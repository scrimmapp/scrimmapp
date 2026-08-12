"use client";

import { useMemo, useState } from "react";
import { Select, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/board/listing-card";
import { useAppData } from "@/lib/app-data";
import { travelRadiusOptions } from "@/lib/taxonomy";

type Filters = { gender: string; level: string; radius: string; search: string };
const defaultFilters: Filters = { gender: "All", level: "All", radius: "All", search: "" };

export function BoardSection() {
  const { listings } = useAppData();
  const [filters, setFilters] = useState<Filters>(defaultFilters);

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
          <h3 className="font-display text-lg font-bold text-ink">Active Scrimmage Board</h3>
          <p className="text-[11px] text-ink-2">Connect directly with coaches looking for matches.</p>
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

      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-rule-2 bg-surface py-16 text-center">
          <p className="text-sm font-semibold text-ink-2">No scrimmages match your filter criteria.</p>
          <Button variant="secondary" size="sm" className="mt-3 normal-case" onClick={() => setFilters(defaultFilters)}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </section>
  );
}
