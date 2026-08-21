CREATE TYPE "public"."calendar_event_kind" AS ENUM('league', 'scrimmage', 'tournament', 'blackout', 'practice');--> statement-breakpoint
CREATE TYPE "public"."cancellation_reason" AS ENUM('field_revoked', 'player_availability', 'weather', 'opponent_backed_out', 'schedule_conflict', 'other');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('sent', 'accepted', 'declined', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('queued', 'sent', 'failed', 'bounced');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('boys', 'girls');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('open', 'matched', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."program_level" AS ENUM('rec', 'club', 'high_school');--> statement-breakpoint
CREATE TYPE "public"."ref_fee_split" AS ENUM('split_50_50', 'host_pays', 'visitor_pays');--> statement-breakpoint
CREATE TYPE "public"."time_window" AS ENUM('morning', 'afternoon', 'evening');--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_name" text NOT NULL,
	"team_name" text NOT NULL,
	"club_name" text,
	"org_type" "program_level" NOT NULL,
	"division" text,
	"default_age_group" text,
	"default_gender" "gender",
	"contact_email" text NOT NULL,
	"phone" text,
	"home_venue_id" uuid,
	"reliability_score" real DEFAULT 0 NOT NULL,
	"ratings_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_contact_email_unique" UNIQUE("contact_email")
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"field_count" integer,
	"surface" text,
	"has_lights" boolean DEFAULT false NOT NULL,
	"parking_notes" text,
	"created_by" uuid,
	"is_public" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"team_name" text NOT NULL,
	"gender" "gender" NOT NULL,
	"age_group" text NOT NULL,
	"level" "program_level" NOT NULL,
	"sub_level" text NOT NULL,
	"match_date" date NOT NULL,
	"time_window" time_window NOT NULL,
	"kickoff_time" time,
	"venue_id" uuid,
	"location_text" text NOT NULL,
	"travel_radius_miles" integer NOT NULL,
	"is_hosting" boolean DEFAULT false NOT NULL,
	"has_ref" boolean DEFAULT false NOT NULL,
	"ref_fee_split" "ref_fee_split" NOT NULL,
	"field_fee_share" boolean DEFAULT false NOT NULL,
	"match_format" text,
	"notes" text,
	"status" "listing_status" DEFAULT 'open' NOT NULL,
	"matched_profile_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"from_profile_id" uuid NOT NULL,
	"to_profile_id" uuid NOT NULL,
	"message" text NOT NULL,
	"status" "connection_status" DEFAULT 'sent' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connection_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"body" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"moderation_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"title" text NOT NULL,
	"event_date" date NOT NULL,
	"time_window" time_window NOT NULL,
	"kind" "calendar_event_kind" NOT NULL,
	"venue_id" uuid,
	"location_text" text,
	"linked_listing_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connection_id" uuid NOT NULL,
	"rater_id" uuid NOT NULL,
	"ratee_id" uuid NOT NULL,
	"stars" integer NOT NULL,
	"on_time" boolean NOT NULL,
	"good_communication" boolean NOT NULL,
	"accurate_field_info" boolean NOT NULL,
	"paid_ref_fee" boolean NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ratings_connection_rater_unique" UNIQUE("connection_id","rater_id"),
	CONSTRAINT "ratings_stars_range" CHECK ("ratings"."stars" >= 1 AND "ratings"."stars" <= 5)
);
--> statement-breakpoint
CREATE TABLE "cancellations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"cancelled_by" uuid NOT NULL,
	"reason_code" "cancellation_reason" NOT NULL,
	"reason_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"to_email" text NOT NULL,
	"template" text NOT NULL,
	"related_type" text,
	"related_id" uuid,
	"sendgrid_message_id" text,
	"status" "email_status" DEFAULT 'queued' NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_home_venue_id_venues_id_fk" FOREIGN KEY ("home_venue_id") REFERENCES "public"."venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venues" ADD CONSTRAINT "venues_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_matched_profile_id_profiles_id_fk" FOREIGN KEY ("matched_profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_from_profile_id_profiles_id_fk" FOREIGN KEY ("from_profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_to_profile_id_profiles_id_fk" FOREIGN KEY ("to_profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_connection_id_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_profiles_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_linked_listing_id_listings_id_fk" FOREIGN KEY ("linked_listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_connection_id_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_rater_id_profiles_id_fk" FOREIGN KEY ("rater_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_ratee_id_profiles_id_fk" FOREIGN KEY ("ratee_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancellations" ADD CONSTRAINT "cancellations_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancellations" ADD CONSTRAINT "cancellations_cancelled_by_profiles_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;