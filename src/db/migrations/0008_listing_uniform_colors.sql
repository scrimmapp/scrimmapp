-- Hand-authored, same reason as 0007: drizzle-kit's snapshot history stops at 0004.
alter table public.listings add column if not exists home_color text;
--> statement-breakpoint
alter table public.listings add column if not exists away_color text;
