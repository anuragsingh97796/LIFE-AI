-- Supabase Schema for LifeOS AI
-- Run this in your Supabase SQL Editor

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  age integer,
  occupation text,
  onboarded boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. USER PREFERENCES TABLE
create table if not exists public.user_preferences (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  available_hours numeric default 2,
  preferred_language text default 'English',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. GOALS TABLE
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  category text,
  target_date date,
  status text default 'active', -- active, completed, archived
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. DAILY PROGRESS TABLE
create table if not exists public.daily_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date default current_date not null,
  completed_tasks integer default 0,
  total_tasks integer default 0,
  life_score integer default 0,
  streak_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  constraint unique_user_date unique (user_id, date)
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.goals enable row level security;
alter table public.daily_progress enable row level security;

-- Drop existing policies if any (safeguard)
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can view their own preferences" on public.user_preferences;
drop policy if exists "Users can update their own preferences" on public.user_preferences;
drop policy if exists "Users can insert their own preferences" on public.user_preferences;
drop policy if exists "Users can view their own goals" on public.goals;
drop policy if exists "Users can create their own goals" on public.goals;
drop policy if exists "Users can update their own goals" on public.goals;
drop policy if exists "Users can delete their own goals" on public.goals;
drop policy if exists "Users can view their own daily progress" on public.daily_progress;
drop policy if exists "Users can create their own daily progress" on public.daily_progress;
drop policy if exists "Users can update their own daily progress" on public.daily_progress;

-- Create Security Policies
-- Profiles
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Preferences
create policy "Users can view their own preferences" on public.user_preferences
  for select using (auth.uid() = user_id);

create policy "Users can update their own preferences" on public.user_preferences
  for update using (auth.uid() = user_id);

create policy "Users can insert their own preferences" on public.user_preferences
  for insert with check (auth.uid() = user_id);

-- Goals
create policy "Users can view their own goals" on public.goals
  for select using (auth.uid() = user_id);

create policy "Users can create their own goals" on public.goals
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own goals" on public.goals
  for update using (auth.uid() = user_id);

create policy "Users can delete their own goals" on public.goals
  for delete using (auth.uid() = user_id);

-- Daily Progress
create policy "Users can view their own daily progress" on public.daily_progress
  for select using (auth.uid() = user_id);

create policy "Users can create their own daily progress" on public.daily_progress
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own daily progress" on public.daily_progress
  for update using (auth.uid() = user_id);

-- Triggers to automatically create a profile and preference on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, onboarded)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), false);

  insert into public.user_preferences (user_id, available_hours, preferred_language)
  values (new.id, 2, 'English');

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant privileges to PostgREST roles to allow API access
grant usage on schema public to anon, authenticated;
grant all privileges on all tables in schema public to anon, authenticated;
grant all privileges on all sequences in schema public to anon, authenticated;
