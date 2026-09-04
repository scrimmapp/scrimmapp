-- Futsal becomes its own League Level (program_level), not a division under Club. Hand-authored,
-- same reason as 0007/0008: drizzle-kit's snapshot history stops at 0004.
alter type public.program_level add value if not exists 'futsal';
