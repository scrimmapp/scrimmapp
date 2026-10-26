-- A comment only hides once two distinct coaches report it, not on a single click (see
-- reportCommentAction). Hand-authored, same reason as 0007-0013.
create table if not exists public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id),
  reporter_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint comment_reports_comment_reporter_unique unique (comment_id, reporter_id)
);
--> statement-breakpoint
alter table public.comment_reports enable row level security;
--> statement-breakpoint
create policy "comment_reports_insert_own" on public.comment_reports for insert
  to authenticated with check (reporter_id = auth.uid());
--> statement-breakpoint
create policy "comment_reports_select_own" on public.comment_reports for select
  to authenticated using (reporter_id = auth.uid());
