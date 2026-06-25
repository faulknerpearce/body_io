-- 0012_recipe_workout_shares.sql
-- User-to-user sharing for recipes and workouts.
--
-- Run in the Supabase SQL editor after 0011_workout_target_reps.sql.

-- ---------------------------------------------------------------------------
-- 1. Share tables
-- ---------------------------------------------------------------------------
create table if not exists public.recipe_shares (
  id                    uuid primary key default gen_random_uuid(),
  recipe_id             uuid not null references public.recipes(id) on delete cascade,
  owner_id              uuid not null references auth.users(id) on delete cascade,
  shared_with_user_id   uuid not null references auth.users(id) on delete cascade,
  owner_display_name    text not null,
  shared_with_display_name text not null,
  saved_copy_id         uuid references public.recipes(id) on delete set null,
  created_at            timestamptz not null default now(),
  unique (recipe_id, shared_with_user_id)
);

create index if not exists recipe_shares_recipient_idx
  on public.recipe_shares (shared_with_user_id, created_at desc);

create index if not exists recipe_shares_owner_idx
  on public.recipe_shares (owner_id, created_at desc);

create table if not exists public.workout_shares (
  id                    uuid primary key default gen_random_uuid(),
  workout_id            uuid not null references public.workouts(id) on delete cascade,
  owner_id              uuid not null references auth.users(id) on delete cascade,
  shared_with_user_id   uuid not null references auth.users(id) on delete cascade,
  owner_display_name    text not null,
  shared_with_display_name text not null,
  saved_copy_id         uuid references public.workouts(id) on delete set null,
  created_at            timestamptz not null default now(),
  unique (workout_id, shared_with_user_id)
);

create index if not exists workout_shares_recipient_idx
  on public.workout_shares (shared_with_user_id, created_at desc);

create index if not exists workout_shares_owner_idx
  on public.workout_shares (owner_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 2. Optional fork attribution
-- ---------------------------------------------------------------------------
alter table public.recipes
  add column if not exists forked_from_recipe_id uuid references public.recipes(id) on delete set null;

alter table public.workouts
  add column if not exists forked_from_workout_id uuid references public.workouts(id) on delete set null;

-- ---------------------------------------------------------------------------
-- 3. User lookup for sharing
-- ---------------------------------------------------------------------------
create or replace function public.find_users_for_share(search_query text)
returns table (
  id uuid,
  display_name text,
  email_hint text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.display_name,
    left(split_part(u.email, '@', 1), 3) || '***@' || split_part(u.email, '@', 2) as email_hint
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id <> auth.uid()
    and (
      lower(trim(u.email)) = lower(trim(search_query))
      or p.display_name ilike '%' || trim(search_query) || '%'
    )
  order by
    case when lower(trim(u.email)) = lower(trim(search_query)) then 0 else 1 end,
    p.display_name
  limit 10;
$$;

revoke all on function public.find_users_for_share(text) from public;
grant execute on function public.find_users_for_share(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. RLS on share tables
-- ---------------------------------------------------------------------------
alter table public.recipe_shares enable row level security;
alter table public.workout_shares enable row level security;

drop policy if exists "Users can view relevant recipe shares" on public.recipe_shares;
create policy "Users can view relevant recipe shares"
  on public.recipe_shares for select
  using (auth.uid() = owner_id or auth.uid() = shared_with_user_id);

drop policy if exists "Owners can create recipe shares" on public.recipe_shares;
create policy "Owners can create recipe shares"
  on public.recipe_shares for insert
  with check (
    auth.uid() = owner_id
    and shared_with_user_id <> auth.uid()
    and exists (
      select 1 from public.recipes
      where id = recipe_id and user_id = auth.uid()
    )
  );

drop policy if exists "Recipients can update recipe share saved copy" on public.recipe_shares;
create policy "Recipients can update recipe share saved copy"
  on public.recipe_shares for update
  using (auth.uid() = shared_with_user_id)
  with check (auth.uid() = shared_with_user_id);

drop policy if exists "Owners can revoke recipe shares" on public.recipe_shares;
create policy "Owners can revoke recipe shares"
  on public.recipe_shares for delete
  using (auth.uid() = owner_id);

drop policy if exists "Users can view relevant workout shares" on public.workout_shares;
create policy "Users can view relevant workout shares"
  on public.workout_shares for select
  using (auth.uid() = owner_id or auth.uid() = shared_with_user_id);

drop policy if exists "Owners can create workout shares" on public.workout_shares;
create policy "Owners can create workout shares"
  on public.workout_shares for insert
  with check (
    auth.uid() = owner_id
    and shared_with_user_id <> auth.uid()
    and exists (
      select 1 from public.workouts
      where id = workout_id and user_id = auth.uid()
    )
  );

drop policy if exists "Recipients can update workout share saved copy" on public.workout_shares;
create policy "Recipients can update workout share saved copy"
  on public.workout_shares for update
  using (auth.uid() = shared_with_user_id)
  with check (auth.uid() = shared_with_user_id);

drop policy if exists "Owners can revoke workout shares" on public.workout_shares;
create policy "Owners can revoke workout shares"
  on public.workout_shares for delete
  using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- 5. Read access for shared content
-- ---------------------------------------------------------------------------
drop policy if exists "Users can view recipes shared with them" on public.recipes;
create policy "Users can view recipes shared with them"
  on public.recipes for select
  using (
    exists (
      select 1 from public.recipe_shares rs
      where rs.recipe_id = recipes.id
        and rs.shared_with_user_id = auth.uid()
    )
  );

drop policy if exists "Users can view ingredients of shared recipes" on public.recipe_ingredients;
create policy "Users can view ingredients of shared recipes"
  on public.recipe_ingredients for select
  using (
    exists (
      select 1 from public.recipe_shares rs
      where rs.recipe_id = recipe_ingredients.recipe_id
        and rs.shared_with_user_id = auth.uid()
    )
  );

drop policy if exists "Users can view workouts shared with them" on public.workouts;
create policy "Users can view workouts shared with them"
  on public.workouts for select
  using (
    exists (
      select 1 from public.workout_shares ws
      where ws.workout_id = workouts.id
        and ws.shared_with_user_id = auth.uid()
    )
  );

drop policy if exists "Users can view exercises of shared workouts" on public.workout_exercises;
create policy "Users can view exercises of shared workouts"
  on public.workout_exercises for select
  using (
    exists (
      select 1 from public.workout_shares ws
      where ws.workout_id = workout_exercises.workout_id
        and ws.shared_with_user_id = auth.uid()
    )
  );