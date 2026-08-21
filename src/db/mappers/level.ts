import type { Level } from "@/lib/types";

export type ProgramLevel = "rec" | "club" | "high_school";

const toDb: Record<Level, ProgramLevel> = {
  Rec: "rec",
  Club: "club",
  "High School": "high_school",
};

const toDisplay: Record<ProgramLevel, Level> = {
  rec: "Rec",
  club: "Club",
  high_school: "High School",
};

export function levelToDb(value: Level): ProgramLevel {
  return toDb[value];
}

export function levelToDisplay(value: ProgramLevel): Level {
  return toDisplay[value];
}
