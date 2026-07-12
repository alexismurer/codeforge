-- Users (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  xp integer not null default 0,
  level integer not null default 1,
  streak integer not null default 0,
  last_solved date,
  created_at timestamptz not null default now()
);

-- Challenges (seeded from JSON files)
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  topic text not null check (topic in ('js', 'ts', 'react')),
  type text not null check (type in ('implement', 'fix-bug', 'refactor', 'multiple-choice')),
  difficulty integer not null check (difficulty between 1 and 5),
  starter_code text not null,
  test_suite text not null,
  solution text not null,
  ai_context text not null default '',
  xp_reward integer not null,
  tags text[] not null default '{}',
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Submissions (one row per run attempt)
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  code text not null,
  passed boolean not null,
  attempt_number integer not null,
  time_to_solve integer,
  ai_hint_used boolean not null default false,
  xp_earned integer not null default 0,
  created_at timestamptz not null default now()
);

-- Per-user challenge progress (no row = unseen)
create table public.challenge_progress (
  user_id uuid not null references public.users(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  status text not null check (status in ('attempted', 'solved')),
  best_time integer,
  attempts integer not null default 0,
  primary key (user_id, challenge_id)
);

-- Earned badges
create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  badge_slug text not null,
  awarded_at timestamptz not null default now(),
  unique (user_id, badge_slug)
);

-- RLS
alter table public.users enable row level security;
alter table public.challenges enable row level security;
alter table public.submissions enable row level security;
alter table public.challenge_progress enable row level security;
alter table public.user_badges enable row level security;

create policy "users_read_all"   on public.users for select using (true);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);

create policy "challenges_read"  on public.challenges for select using (auth.role() = 'authenticated');

create policy "submissions_read_own"   on public.submissions for select using (auth.uid() = user_id);
create policy "submissions_insert_own" on public.submissions for insert with check (auth.uid() = user_id);

create policy "progress_read_own"   on public.challenge_progress for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.challenge_progress for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.challenge_progress for update using (auth.uid() = user_id);

create policy "badges_read_all"   on public.user_badges for select using (true);
create policy "badges_insert_own" on public.user_badges for insert with check (auth.uid() = user_id);

-- Auto-create user profile on first OAuth sign-in
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, username, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
