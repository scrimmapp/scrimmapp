-- Hand-authored: enables row-level security on every table and adds the policies the current
-- UI actually needs. This is a best-effort design pass, not a security audit; ratings and
-- cancellations have no UI touching them yet (policies are forward-looking), and there is no
-- column-level restriction stopping a message participant from rewriting body instead of just
-- read_at (Postgres RLS can't express that without a trigger).

alter table public.profiles enable row level security;
--> statement-breakpoint
alter table public.venues enable row level security;
--> statement-breakpoint
alter table public.listings enable row level security;
--> statement-breakpoint
alter table public.connections enable row level security;
--> statement-breakpoint
alter table public.messages enable row level security;
--> statement-breakpoint
alter table public.comments enable row level security;
--> statement-breakpoint
alter table public.calendar_events enable row level security;
--> statement-breakpoint
alter table public.ratings enable row level security;
--> statement-breakpoint
alter table public.cancellations enable row level security;
--> statement-breakpoint
alter table public.email_log enable row level security;
--> statement-breakpoint

-- profiles: authenticated-only, not public. contact_email is personal contact info; an
-- anonymous visitor hitting the Supabase REST API directly should not be able to scrape it.
create policy "profiles_select" on public.profiles for select
  to authenticated using (true);
--> statement-breakpoint
create policy "profiles_update_own" on public.profiles for update
  to authenticated using (auth.uid() = id);
--> statement-breakpoint
-- no insert policy: rows are only ever created by the security-definer trigger.

-- venues: the public directory, plus a coach's own unlisted entries.
create policy "venues_select" on public.venues for select
  using (is_public or created_by = auth.uid());
--> statement-breakpoint
create policy "venues_insert_own" on public.venues for insert
  to authenticated with check (created_by = auth.uid());
--> statement-breakpoint
create policy "venues_update_own" on public.venues for update
  to authenticated using (created_by = auth.uid());
--> statement-breakpoint

-- listings: the board is public. Writes are owner-only.
create policy "listings_select" on public.listings for select
  using (true);
--> statement-breakpoint
create policy "listings_insert_own" on public.listings for insert
  to authenticated with check (owner_id = auth.uid());
--> statement-breakpoint
create policy "listings_update_own" on public.listings for update
  to authenticated using (owner_id = auth.uid());
--> statement-breakpoint

-- connections: only the two participants can see or act on a thread.
create policy "connections_select_participant" on public.connections for select
  to authenticated using (from_profile_id = auth.uid() or to_profile_id = auth.uid());
--> statement-breakpoint
create policy "connections_insert_as_self" on public.connections for insert
  to authenticated with check (from_profile_id = auth.uid());
--> statement-breakpoint
create policy "connections_update_participant" on public.connections for update
  to authenticated using (from_profile_id = auth.uid() or to_profile_id = auth.uid());
--> statement-breakpoint

-- messages: only participants of the parent connection.
create policy "messages_select_participant" on public.messages for select
  to authenticated using (
    exists (
      select 1 from public.connections c
      where c.id = messages.connection_id
        and (c.from_profile_id = auth.uid() or c.to_profile_id = auth.uid())
    )
  );
--> statement-breakpoint
create policy "messages_insert_participant" on public.messages for insert
  to authenticated with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.connections c
      where c.id = messages.connection_id
        and (c.from_profile_id = auth.uid() or c.to_profile_id = auth.uid())
    )
  );
--> statement-breakpoint
create policy "messages_update_participant" on public.messages for update
  to authenticated using (
    exists (
      select 1 from public.connections c
      where c.id = messages.connection_id
        and (c.from_profile_id = auth.uid() or c.to_profile_id = auth.uid())
    )
  );
--> statement-breakpoint

-- comments: the public pitch-side chat. Hidden (moderated) comments disappear for everyone.
create policy "comments_select_visible" on public.comments for select
  using (is_hidden = false);
--> statement-breakpoint
create policy "comments_insert_own" on public.comments for insert
  to authenticated with check (author_id = auth.uid());
--> statement-breakpoint

-- calendar_events: fully private to the owning coach, matching the calendar_conflicts view's
-- own per-profile semantics.
create policy "calendar_events_select_own" on public.calendar_events for select
  to authenticated using (profile_id = auth.uid());
--> statement-breakpoint
create policy "calendar_events_insert_own" on public.calendar_events for insert
  to authenticated with check (profile_id = auth.uid());
--> statement-breakpoint
create policy "calendar_events_update_own" on public.calendar_events for update
  to authenticated using (profile_id = auth.uid());
--> statement-breakpoint
create policy "calendar_events_delete_own" on public.calendar_events for delete
  to authenticated using (profile_id = auth.uid());
--> statement-breakpoint

-- ratings: no UI yet. Readable by anyone (for a future aggregate score display), insertable
-- only by the rater themself.
create policy "ratings_select" on public.ratings for select
  using (true);
--> statement-breakpoint
create policy "ratings_insert_own" on public.ratings for insert
  to authenticated with check (rater_id = auth.uid());
--> statement-breakpoint

-- cancellations: no UI yet. Readable by anyone (transparency), insertable only by whoever is
-- cancelling.
create policy "cancellations_select" on public.cancellations for select
  using (true);
--> statement-breakpoint
create policy "cancellations_insert_own" on public.cancellations for insert
  to authenticated with check (cancelled_by = auth.uid());

-- email_log: no policies at all. RLS is default-deny, so this is fully locked to the anon and
-- authenticated roles; only the service role (which bypasses RLS entirely) can touch it, and
-- nothing in this app uses the service role.
