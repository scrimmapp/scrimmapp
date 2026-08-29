import type { Gender, Level } from "@/lib/types";

// Club and Rec run age-bracket seasons (U8-U18); High School runs by roster tier instead
// (Varsity/JV/Frosh), never by age. Keeping one combined list let a Club listing show
// "Varsity" as an age group, which isn't a real thing outside a high school program.
const clubAndRecAgeGroups = ["U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18"];
const highSchoolAgeGroups = ["Varsity", "JV", "Frosh"];

export function ageGroupsFor(level: Level): string[] {
  return level === "High School" ? highSchoolAgeGroups : clubAndRecAgeGroups;
}

// Full combined list, for the one spot (a coach's general profile default) with no single
// level context to key off of.
export const ageGroups = [...clubAndRecAgeGroups, ...highSchoolAgeGroups];

// Club pathways diverge by gender (per Javi, Aug 2026): boys and girls run separate league
// systems, not just separate divisions within one shared list. High school (CIF-SS) divisions
// and the rec sub-levels are the same regardless of gender.
const clubSubLevelsByGender: Record<Gender, string[]> = {
  Boys: ["MLS Next", "ECNL", "MLS Next 2", "ECRL", "EA", "EA2", "N1", "Flight 1", "Flight 2", "Flight 3"],
  Girls: ["ECNL", "GA", "ECRL", "GA Aspire", "DPL", "N1", "DPL Open", "Flight 1", "Flight 2", "Flight 3"],
};

const highSchoolSubLevels = [
  "Open Division",
  "Division 1",
  "Division 2",
  "Division 3",
  "Division 4",
  "Division 5",
  "Division 6",
  "Division 7",
];

const recSubLevels = ["AYSO Select", "AYSO Extra", "Signature League"];

export function subLevelsFor(level: Level, gender: Gender): string[] {
  if (level === "Club") return clubSubLevelsByGender[gender];
  if (level === "High School") return highSchoolSubLevels;
  return recSubLevels;
}

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
