import type { RefFee } from "@/lib/types";

export type DbRefFeeSplit = "split_50_50" | "host_pays" | "visitor_pays" | "no_ref";

const toDb: Record<RefFee, DbRefFeeSplit> = {
  "50/50 Split": "split_50_50",
  "Host Pays Ref": "host_pays",
  "Visitor Pays": "visitor_pays",
  "No Ref": "no_ref",
};

const toDisplay: Record<DbRefFeeSplit, RefFee> = {
  split_50_50: "50/50 Split",
  host_pays: "Host Pays Ref",
  visitor_pays: "Visitor Pays",
  no_ref: "No Ref",
};

export function refFeeToDb(value: RefFee): DbRefFeeSplit {
  return toDb[value];
}

export function refFeeToDisplay(value: DbRefFeeSplit): RefFee {
  return toDisplay[value];
}
