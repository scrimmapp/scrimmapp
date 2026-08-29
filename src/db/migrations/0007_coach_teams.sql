-- Hand-authored, matching 0002/0005/0006: drizzle-kit's snapshot history has no entries past
-- 0004 (0005 and 0006 were hand-authored too), so `drizzle-kit generate` sees a phantom diff
-- against email_log's renamed column and demands an interactive rename-or-drop prompt that
-- can't be answered non-interactively. A plain new table has no such ambiguity to hand-write.
create table if not exists public.coach_teams (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  team_name text not null,
  gender "gender" not null,
  age_group text not null,
  level "program_level" not null,
  sub_level text not null,
  created_at timestamptz not null default now()
);
--> statement-breakpoint
alter table public.coach_teams enable row level security;
--> statement-breakpoint
-- Public read, like listings and profiles: a coach's teams need to be visible to whoever
-- they're messaging, not just to themselves.
create policy "coach_teams_select" on public.coach_teams for select
  using (true);
--> statement-breakpoint
create policy "coach_teams_insert_own" on public.coach_teams for insert
  to authenticated with check (profile_id = auth.uid());
--> statement-breakpoint
create policy "coach_teams_update_own" on public.coach_teams for update
  to authenticated using (profile_id = auth.uid());
--> statement-breakpoint
create policy "coach_teams_delete_own" on public.coach_teams for delete
  to authenticated using (profile_id = auth.uid());
