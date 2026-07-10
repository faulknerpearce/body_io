-- 0018_wearable_day_total.sql
-- Profile flag for fitness-tracker users + per-day device total burn
-- (replaces BMR as the day's base when set).
--
-- Run in the Supabase SQL editor after 0017_profile_gender_bmr.sql.

-- ---------------------------------------------------------------------------
-- 1. Profile: uses a wearable for daily burn
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists uses_wearable boolean not null default false;

-- ---------------------------------------------------------------------------
-- 2. Per-day device total (Fitbit / watch full-day calories)
-- ---------------------------------------------------------------------------
create table if not exists public.daily_device_totals (
  user_id           uuid not null references auth.users(id) on delete cascade,
  energy_date       date not null,
  device_total_kcal integer not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  primary key (user_id, energy_date),
  constraint daily_device_totals_kcal_check
    check (device_total_kcal >= 0 and device_total_kcal <= 10000)
);

create index if not exists daily_device_totals_user_date_idx
  on public.daily_device_totals (user_id, energy_date desc);

alter table public.daily_device_totals enable row level security;

drop policy if exists "Users can view own device totals" on public.daily_device_totals;
create policy "Users can view own device totals"
  on public.daily_device_totals for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own device totals" on public.daily_device_totals;
create policy "Users can insert own device totals"
  on public.daily_device_totals for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own device totals" on public.daily_device_totals;
create policy "Users can update own device totals"
  on public.daily_device_totals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own device totals" on public.daily_device_totals;
create policy "Users can delete own device totals"
  on public.daily_device_totals for delete
  using (auth.uid() = user_id);
