import type { CompetitivePreference } from "@/lib/types";

export type DbCompetitivePreference = "similar" | "stronger" | "developing";

const toDb: Record<CompetitivePreference, DbCompetitivePreference> = {
  Similar: "similar",
  Stronger: "stronger",
  Developing: "developing",
};

const toDisplay: Record<DbCompetitivePreference, CompetitivePreference> = {
  similar: "Similar",
  stronger: "Stronger",
  developing: "Developing",
};

export function competitivePreferenceToDb(value: CompetitivePreference): DbCompetitivePreference {
  return toDb[value];
}

export function competitivePreferenceToDisplay(value: DbCompetitivePreference): CompetitivePreference {
  return toDisplay[value];
}
