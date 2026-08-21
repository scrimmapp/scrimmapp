-- Hand-authored (not drizzle-kit generate output): a coach's own calendar entries unioned
-- with the two sides of any matched listing, self-joined on same date + same time_window.
-- "Overlapping time_window" is equality on the 3-bucket enum (morning/afternoon/evening),
-- matching how the frontend already models time; nothing queries this yet, that's a
-- separate follow-on task.
create or replace view public.calendar_conflicts as
with occupied as (
  select ce.profile_id, ce.event_date as conflict_date, ce.time_window,
         'calendar_event'::text as source_type, ce.id as source_id, ce.title as label
  from calendar_events ce
  union all
  select l.owner_id, l.match_date, l.time_window, 'listing'::text, l.id, l.team_name
  from listings l where l.status = 'matched' and l.owner_id is not null
  union all
  select l.matched_profile_id, l.match_date, l.time_window, 'listing'::text, l.id, l.team_name
  from listings l where l.status = 'matched' and l.matched_profile_id is not null
)
select a.profile_id, a.conflict_date,
       a.source_type as a_source_type, a.source_id as a_source_id, a.label as a_label,
       b.source_type as b_source_type, b.source_id as b_source_id, b.label as b_label,
       a.time_window
from occupied a
join occupied b
  on a.profile_id = b.profile_id and a.conflict_date = b.conflict_date
 and a.time_window = b.time_window
 and (a.source_type, a.source_id::text) < (b.source_type, b.source_id::text);
