-- Hand-authored, same reason as 0007-0009: drizzle-kit's snapshot history stops at 0004.
alter table public.listings add column if not exists field_number text;
