import type { TravelRadius } from "@/lib/types";

// Plan doc decision: travel_radius_miles is a real integer column, not the mock's free-text
// string, so it can actually be filtered/sorted and used in a distance query later.
const toDb: Record<TravelRadius, number> = {
  "Host Pitch Only (0 mi)": 0,
  "Up to 10 miles": 10,
  "Up to 25 miles": 25,
  "Up to 50 miles": 50,
  "100+ miles (Willing to Travel)": 100,
};

const buckets: Array<[number, TravelRadius]> = [
  [0, "Host Pitch Only (0 mi)"],
  [10, "Up to 10 miles"],
  [25, "Up to 25 miles"],
  [50, "Up to 50 miles"],
  [100, "100+ miles (Willing to Travel)"],
];

export function travelRadiusToDb(value: TravelRadius): number {
  return toDb[value];
}

// Miles that don't land exactly on a bucket (e.g. a future geographic-search feature) round
// up to the next bucket, so "we'll travel this far" never underclaims a coach's stated range.
export function travelRadiusToDisplay(miles: number): TravelRadius {
  for (const [bucketMiles, label] of buckets) {
    if (miles <= bucketMiles) return label;
  }
  return "100+ miles (Willing to Travel)";
}
