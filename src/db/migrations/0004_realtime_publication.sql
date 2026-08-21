-- Hand-authored: adds the tables that benefit from live updates to Supabase's realtime
-- publication. Client subscriptions are only wired up for listings (the board) and comments
-- (pitch-side chat) this round; connections/messages are included here too since it is cheap
-- to do now, but no client subscribes to them yet, that is a deferred followup (a live-
-- updating inbox badge).
alter publication supabase_realtime add table public.listings, public.comments, public.connections, public.messages;
