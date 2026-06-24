-- 0011_workout_target_reps.sql
-- Per-exercise targets are reps, not sets. Run after 0010_workout_duration_calories.sql.

alter table public.workout_exercises
  drop constraint if exists workout_exercises_target_sets_check;

alter table public.workout_exercises
  rename column target_sets to target_reps;

alter table public.workout_exercises
  add constraint workout_exercises_target_reps_check
  check (target_reps > 0);

alter table public.activity_exercises
  drop constraint if exists activity_exercises_sets_completed_check;

alter table public.activity_exercises
  rename column sets_completed to reps_completed;

alter table public.activity_exercises
  add constraint activity_exercises_reps_completed_check
  check (reps_completed > 0);