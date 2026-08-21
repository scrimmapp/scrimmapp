import { pgEnum } from "drizzle-orm/pg-core";

export const programLevelEnum = pgEnum("program_level", ["rec", "club", "high_school"]);
export const genderEnum = pgEnum("gender", ["boys", "girls"]);
export const timeWindowEnum = pgEnum("time_window", ["morning", "afternoon", "evening"]);
export const refFeeSplitEnum = pgEnum("ref_fee_split", ["split_50_50", "host_pays", "visitor_pays"]);
export const listingStatusEnum = pgEnum("listing_status", ["open", "matched", "cancelled", "completed"]);
export const connectionStatusEnum = pgEnum("connection_status", ["sent", "accepted", "declined", "withdrawn"]);
export const calendarEventKindEnum = pgEnum("calendar_event_kind", [
  "league",
  "scrimmage",
  "tournament",
  "blackout",
  "practice",
]);
export const cancellationReasonEnum = pgEnum("cancellation_reason", [
  "field_revoked",
  "player_availability",
  "weather",
  "opponent_backed_out",
  "schedule_conflict",
  "other",
]);
export const emailStatusEnum = pgEnum("email_status", ["queued", "sent", "failed", "bounced"]);
