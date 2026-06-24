-- 0007_profile_timezone.sql
-- Store each user's IANA timezone so server-side logging uses the same
-- calendar day as the web app (avoids UTC vs local mismatches on MCP/Workers).

alter table public.profiles
  add column if not exists time_zone text not null default 'UTC';