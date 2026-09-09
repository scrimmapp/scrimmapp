import type { listings } from "../schema";
import type { Listing } from "@/lib/types";
import { genderToDisplay } from "./gender";
import { levelToDisplay } from "./level";
import { timeWindowToDisplay } from "./time-window";
import { refFeeToDisplay } from "./ref-fee";
import { competitivePreferenceToDisplay } from "./competitive-preference";
import { travelRadiusToDisplay } from "./travel-radius";
import { toDateString } from "./date";

type ListingRow = typeof listings.$inferSelect;

export function listingToDisplay(row: ListingRow): Listing {
  return {
    id: row.id,
    ownerId: row.ownerId,
    createdAt: row.createdAt.getTime(),
    teamName: row.teamName,
    gender: genderToDisplay(row.gender),
    age: row.ageGroup,
    level: levelToDisplay(row.level),
    subLevel: row.subLevel,
    competitivePreference: competitivePreferenceToDisplay(row.competitivePreference),
    travelRadius: travelRadiusToDisplay(row.travelRadiusMiles),
    date: toDateString(row.matchDate),
    time: timeWindowToDisplay(row.timeWindow),
    location: row.locationText,
    fieldNumber: row.fieldNumber ?? undefined,
    isHosting: row.isHosting,
    hasRef: row.hasRef,
    refFee: refFeeToDisplay(row.refFeeSplit),
    hasFieldFee: row.fieldFeeShare,
    homeColor: row.homeColor ?? undefined,
    awayColor: row.awayColor ?? undefined,
    notes: row.notes ?? undefined,
    // DB status values are already the lowercase strings the frontend type uses directly.
    status: row.status,
    matchedProfileId: row.matchedProfileId ?? undefined,
  };
}
