import type { Level } from "@/lib/types";

export const ageGroups = [
  "U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18",
  "Varsity", "JV", "Frosh",
];

export const subLevelsByLevel: Record<Level, string[]> = {
  Club: ["Premier (ECNL / RL)", "Elite (MLS Next / GA)", "EA / DPL", "SoCal Flight 1/2/3"],
  "High School": ["CIF Division 1", "CIF Division 2", "CIF Division 3", "CIF Division 4"],
  Rec: ["AYSO Select", "AYSO Extra", "Signature League"],
};

export const travelRadiusOptions = [
  "Host Pitch Only (0 mi)",
  "Up to 10 miles",
  "Up to 25 miles",
  "Up to 50 miles",
  "100+ miles (Willing to Travel)",
] as const;

export const timeWindowOptions = ["Morning", "Afternoon", "Evening"] as const;

export const refFeeOptions = ["50/50 Split", "Host Pays Ref", "Visitor Pays"] as const;

export const cancellationReasonOptions: { value: string; label: string }[] = [
  { value: "field_revoked", label: "Field access revoked" },
  { value: "player_availability", label: "Player availability" },
  { value: "weather", label: "Weather" },
  { value: "opponent_backed_out", label: "Opponent backed out" },
  { value: "schedule_conflict", label: "Schedule conflict" },
  { value: "other", label: "Other" },
];
