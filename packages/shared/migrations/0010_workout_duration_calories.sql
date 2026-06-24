-- 0010_workout_duration_calories.sql
-- Default duration and calories per one full set of a workout template.

alter table public.workouts
  add column if not exists default_duration_minutes integer;

alter table public.workouts
  add column if not exists default_calories integer;

alter table public.workouts
  drop constraint if exists workouts_default_duration_minutes_check;

alter table public.workouts
  add constraint workouts_default_duration_minutes_check
  check (default_duration_minutes is null or default_duration_minutes >= 0);

alter table public.workouts
  drop constraint if exists workouts_default_calories_check;

alter table public.workouts
  add constraint workouts_default_calories_check
  check (default_calories is null or default_calories >= 0);