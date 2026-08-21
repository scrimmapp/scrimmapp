-- Hand-authored: wires profiles to Supabase's managed auth.users table. org_type gets a real
-- column default rather than a nullable column, since the signup form only collects
-- name/team/email (no org type yet) and nullable would ripple into the mapper layer and
-- every read site. 'club' is the most common of the three levels in the seed data.
alter table public.profiles alter column org_type set default 'club';
--> statement-breakpoint
-- The demo-seeded profiles (Javi Reyes + 4 synthesized placeholders) have no matching
-- auth.users row, since they predate real auth. The FK constraint below cannot be added
-- while they exist, so clear them (and everything with a NOT NULL FK to profiles) first.
-- venues is untouched: created_by is nullable and was left null by the seed script, so no
-- venue actually references a profile. Real signups repopulate profiles going forward; the
-- seed script itself is not run again against a live project after this point.
delete from public.messages;
--> statement-breakpoint
delete from public.connections;
--> statement-breakpoint
delete from public.calendar_events;
--> statement-breakpoint
delete from public.listings;
--> statement-breakpoint
delete from public.profiles;
--> statement-breakpoint
alter table public.profiles
  add constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade;
--> statement-breakpoint
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, coach_name, team_name, contact_email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'coach_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'team_name', 'Unnamed Team'),
    new.email
  );
  return new;
end;
$$;
--> statement-breakpoint
drop trigger if exists on_auth_user_created on auth.users;
--> statement-breakpoint
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
