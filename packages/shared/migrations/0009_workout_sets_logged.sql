-- 0009_workout_sets_logged.sql
-- How many full rounds of a workout template were completed (like servings_logged on food_entries).

alter table public.activities
  add column if not exists workout_sets_logged numeric(4, 2);

alter table public.activities
  drop constraint if exists activities_workout_sets_logged_check;

alter table public.activities
  add constraint activities_workout_sets_logged_check
  check (workout_sets_logged is null or workout_sets_logged > 0::numeric);