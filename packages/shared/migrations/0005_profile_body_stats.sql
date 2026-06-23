-- 0005_profile_body_stats.sql
-- Basic body stats on profiles for the Profile page.
--
-- Run in the Supabase SQL editor after 0004_goals_and_macros.sql.

alter table public.profiles
  add column if not exists age integer,
  add column if not exists height_cm integer,
  add column if not exists weight_kg numeric(5, 1);

alter table public.profiles
  drop constraint if exists profiles_age_check;

alter table public.profiles
  add constraint profiles_age_check
  check (age is null or (age >= 13 and age <= 120));

alter table public.profiles
  drop constraint if exists profiles_height_cm_check;

alter table public.profiles
  add constraint profiles_height_cm_check
  check (height_cm is null or (height_cm >= 100 and height_cm <= 250));

alter table public.profiles
  drop constraint if exists profiles_weight_kg_check;

alter table public.profiles
  add constraint profiles_weight_kg_check
  check (weight_kg is null or (weight_kg >= 30 and weight_kg <= 300));