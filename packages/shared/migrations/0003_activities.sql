-- 0003_activities.sql
-- Activity outputs (manual entry): type, duration, distance, heart rate, calories.
--
-- Run in the Supabase SQL editor. Idempotent where practical.
-- Prerequisites: 0002_auth_and_user_scoping.sql

create table if not exists public.activities (
  id                  text primary key,
  user_id             uuid not null references auth.users(id) on delete cascade,
  name                text not null,
  activity_type       text not null,
  activity_date       date not null default current_date,
  distance_meters     real,
  moving_time_seconds integer not null,
  average_heartrate   integer,
  max_heartrate       integer,
  calories            integer,
  created_at          timestamptz default now()
);

create index if not exists activities_user_date_idx
  on public.activities (user_id, activity_date, created_at);

alter table public.activities enable row level security;

drop policy if exists "Users can view own activities" on public.activities;
create policy "Users can view own activities"
  on public.activities for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own activities" on public.activities;
create policy "Users can insert own activities"
  on public.activities for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own activities" on public.activities;
create policy "Users can update own activities"
  on public.activities for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own activities" on public.activities;
create policy "Users can delete own activities"
  on public.activities for delete
  using (auth.uid() = user_id);