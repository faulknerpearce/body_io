-- 0008_workouts.sql
-- Saved workout templates with exercise lines; logged via activities + activity_exercises.
--
-- Run in the Supabase SQL editor after 0007_profile_timezone.sql.

-- ---------------------------------------------------------------------------
-- 1. Workouts (user-scoped strength templates)
-- ---------------------------------------------------------------------------
create table if not exists public.workouts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text not null default '',
  icon        text not null default 'fa-dumbbell',
  icon_bg     text not null default '#ecfdf5',
  icon_color  text not null default '#134e4b',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists workouts_user_updated_idx
  on public.workouts (user_id, updated_at desc);

alter table public.workouts enable row level security;

drop policy if exists "Users can view own workouts" on public.workouts;
create policy "Users can view own workouts"
  on public.workouts for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own workouts" on public.workouts;
create policy "Users can insert own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own workouts" on public.workouts;
create policy "Users can update own workouts"
  on public.workouts for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own workouts" on public.workouts;
create policy "Users can delete own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2. Workout exercises (template lines per workout)
-- ---------------------------------------------------------------------------
create table if not exists public.workout_exercises (
  id          uuid primary key default gen_random_uuid(),
  workout_id  uuid not null references public.workouts(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  sort_order  integer not null default 0,
  name        text not null,
  target_sets integer not null default 1,
  created_at  timestamptz not null default now()
);

alter table public.workout_exercises
  drop constraint if exists workout_exercises_target_sets_check;

alter table public.workout_exercises
  add constraint workout_exercises_target_sets_check
  check (target_sets > 0);

create index if not exists workout_exercises_workout_sort_idx
  on public.workout_exercises (workout_id, sort_order);

alter table public.workout_exercises enable row level security;

drop policy if exists "Users can view own workout exercises" on public.workout_exercises;
create policy "Users can view own workout exercises"
  on public.workout_exercises for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own workout exercises" on public.workout_exercises;
create policy "Users can insert own workout exercises"
  on public.workout_exercises for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own workout exercises" on public.workout_exercises;
create policy "Users can update own workout exercises"
  on public.workout_exercises for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own workout exercises" on public.workout_exercises;
create policy "Users can delete own workout exercises"
  on public.workout_exercises for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. Provenance on activity log entries
-- ---------------------------------------------------------------------------
alter table public.activities
  add column if not exists workout_id uuid references public.workouts(id) on delete set null;

-- ---------------------------------------------------------------------------
-- 4. Activity exercises (logged set counts per exercise)
-- ---------------------------------------------------------------------------
create table if not exists public.activity_exercises (
  id                  uuid primary key default gen_random_uuid(),
  activity_id         text not null references public.activities(id) on delete cascade,
  user_id             uuid not null references auth.users(id) on delete cascade,
  workout_exercise_id uuid references public.workout_exercises(id) on delete set null,
  sort_order          integer not null default 0,
  name                text not null,
  sets_completed      integer not null,
  created_at          timestamptz not null default now()
);

alter table public.activity_exercises
  drop constraint if exists activity_exercises_sets_completed_check;

alter table public.activity_exercises
  add constraint activity_exercises_sets_completed_check
  check (sets_completed > 0);

create index if not exists activity_exercises_activity_sort_idx
  on public.activity_exercises (activity_id, sort_order);

alter table public.activity_exercises enable row level security;

drop policy if exists "Users can view own activity exercises" on public.activity_exercises;
create policy "Users can view own activity exercises"
  on public.activity_exercises for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own activity exercises" on public.activity_exercises;
create policy "Users can insert own activity exercises"
  on public.activity_exercises for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own activity exercises" on public.activity_exercises;
create policy "Users can update own activity exercises"
  on public.activity_exercises for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own activity exercises" on public.activity_exercises;
create policy "Users can delete own activity exercises"
  on public.activity_exercises for delete
  using (auth.uid() = user_id);