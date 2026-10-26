import { pgTable, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { comments } from "./comments";
import { profiles } from "./profiles";

// One row per (comment, reporter): reportCommentAction only hides a comment once enough
// distinct coaches report it, not on a single click, so one person can't silently censor
// another coach's comment on their own.
export const commentReports = pgTable(
  "comment_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commentId: uuid("comment_id").notNull().references(() => comments.id),
    reporterId: uuid("reporter_id").notNull().references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("comment_reports_comment_reporter_unique").on(table.commentId, table.reporterId)],
);
