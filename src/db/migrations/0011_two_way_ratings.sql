-- Two-way post-match ratings (Javi, Sep 2026): the visiting coach can now rate the host back,
-- not just the other direction. good_communication and paid_ref_fee are owner-rating-only, so
-- they drop NOT NULL; the new columns are all nullable for the same reason (only populated by
-- whichever direction asks for them). Hand-authored, same reason as 0007-0010.
alter table public.ratings alter column good_communication drop not null;
--> statement-breakpoint
alter table public.ratings alter column paid_ref_fee drop not null;
--> statement-breakpoint
alter table public.ratings add column if not exists respectful_sidelines boolean;
--> statement-breakpoint
alter table public.ratings add column if not exists field_setup_quality boolean;
--> statement-breakpoint
alter table public.ratings add column if not exists referees_as_agreed boolean;
--> statement-breakpoint
alter table public.ratings add column if not exists evenly_matched_tier boolean;
--> statement-breakpoint
alter table public.ratings add column if not exists would_travel_again boolean;
