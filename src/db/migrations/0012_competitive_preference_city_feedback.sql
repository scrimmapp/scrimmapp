-- Hand-authored, same reason as 0007-0011: drizzle-kit's snapshot history stops at 0004.
CREATE TYPE "public"."competitive_preference" AS ENUM('similar', 'stronger', 'developing');
--> statement-breakpoint
CREATE TYPE "public"."feedback_category" AS ENUM('issue', 'improvement', 'general');
--> statement-breakpoint
alter table public.listings
  add column if not exists competitive_preference public.competitive_preference not null default 'similar';
--> statement-breakpoint
alter table public.profiles add column if not exists city text;
--> statement-breakpoint
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id),
  category public.feedback_category not null,
  message text not null,
  contact_email text,
  created_at timestamptz not null default now()
);
