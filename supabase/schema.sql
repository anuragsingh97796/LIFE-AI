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
  description text,
  category text,
  priority text default 'Medium', -- Critical, High, Medium, Low
  target_date date,
  status text default 'active', -- active, completed, archived
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
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

-- 5. GOAL MILESTONES TABLE
create table if not exists public.goal_milestones (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.goals(id) on delete cascade not null,
  title text not null,
  description text,
  target_date date,
  completion_percentage integer default 0,
  status text default 'pending', -- pending, in_progress, completed
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. GOAL PROJECTS TABLE
create table if not exists public.goal_projects (
  id uuid default gen_random_uuid() primary key,
  milestone_id uuid references public.goal_milestones(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'pending', -- pending, in_progress, completed
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. TASKS TABLE
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.goal_projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade not null, -- Keep user_id for easier direct querying
  title text not null,
  description text,
  priority text default 'Medium',
  estimated_minutes integer default 30,
  scheduled_date date,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 8. GOAL ANALYTICS TABLE
create table if not exists public.goal_analytics (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.goals(id) on delete cascade not null unique,
  progress_percentage integer default 0,
  predicted_completion_date date,
  risk_score integer default 0,
  consistency_score integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.goals enable row level security;
alter table public.daily_progress enable row level security;
alter table public.goal_milestones enable row level security;
alter table public.goal_projects enable row level security;
alter table public.tasks enable row level security;
alter table public.goal_analytics enable row level security;

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

-- Goal Milestones
create policy "Users can view their own goal milestones" on public.goal_milestones
  for select using (auth.uid() = (select user_id from public.goals where id = goal_id));

create policy "Users can create their own goal milestones" on public.goal_milestones
  for insert with check (auth.uid() = (select user_id from public.goals where id = goal_id));

create policy "Users can update their own goal milestones" on public.goal_milestones
  for update using (auth.uid() = (select user_id from public.goals where id = goal_id));

create policy "Users can delete their own goal milestones" on public.goal_milestones
  for delete using (auth.uid() = (select user_id from public.goals where id = goal_id));

-- Goal Projects
create policy "Users can view their own goal projects" on public.goal_projects
  for select using (auth.uid() = (select g.user_id from public.goals g join public.goal_milestones gm on g.id = gm.goal_id where gm.id = milestone_id));

create policy "Users can create their own goal projects" on public.goal_projects
  for insert with check (auth.uid() = (select g.user_id from public.goals g join public.goal_milestones gm on g.id = gm.goal_id where gm.id = milestone_id));

create policy "Users can update their own goal projects" on public.goal_projects
  for update using (auth.uid() = (select g.user_id from public.goals g join public.goal_milestones gm on g.id = gm.goal_id where gm.id = milestone_id));

create policy "Users can delete their own goal projects" on public.goal_projects
  for delete using (auth.uid() = (select g.user_id from public.goals g join public.goal_milestones gm on g.id = gm.goal_id where gm.id = milestone_id));

-- Tasks
create policy "Users can view their own tasks" on public.tasks
  for select using (auth.uid() = user_id);

create policy "Users can create their own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own tasks" on public.tasks
  for update using (auth.uid() = user_id);

create policy "Users can delete their own tasks" on public.tasks
  for delete using (auth.uid() = user_id);

-- Goal Analytics
create policy "Users can view their own goal analytics" on public.goal_analytics
  for select using (auth.uid() = (select user_id from public.goals where id = goal_id));

create policy "Users can create their own goal analytics" on public.goal_analytics
  for insert with check (auth.uid() = (select user_id from public.goals where id = goal_id));

create policy "Users can update their own goal analytics" on public.goal_analytics
  for update using (auth.uid() = (select user_id from public.goals where id = goal_id));

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
