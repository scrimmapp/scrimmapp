import type { Gender } from "@/lib/types";

export type DbGender = "boys" | "girls";

const toDb: Record<Gender, DbGender> = {
  Boys: "boys",
  Girls: "girls",
};

const toDisplay: Record<DbGender, Gender> = {
  boys: "Boys",
  girls: "Girls",
};

export function genderToDb(value: Gender): DbGender {
  return toDb[value];
}

export function genderToDisplay(value: DbGender): Gender {
  return toDisplay[value];
}
