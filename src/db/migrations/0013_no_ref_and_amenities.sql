-- Adds a "No Ref" ref-fee option plus three listing amenity flags (hydration station,
-- canopies for opponent, game recorded), per Javi Sep 2026. Hand-authored, same reason as
-- 0007-0012.
alter type public.ref_fee_split add value if not exists 'no_ref';
--> statement-breakpoint
alter table public.listings add column if not exists hydration_station boolean not null default false;
--> statement-breakpoint
alter table public.listings add column if not exists canopies_for_opponent boolean not null default false;
--> statement-breakpoint
alter table public.listings add column if not exists is_recorded boolean not null default false;
