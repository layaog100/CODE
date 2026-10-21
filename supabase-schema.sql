-- Portify database setup (Supabase)
-- Run this script in Supabase Dashboard > SQL Editor.
-- Cloud data is private to each authenticated user through Row Level Security.

create extension if not exists pgcrypto;

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  job_title text default '',
  email text default '',
  phone text default '',
  address text default '',
  profile_picture text default '',
  about text default '',
  education text default '',
  skills text default '',
  projects text default '',
  experience text default '',
  social_links text default '',
  template text not null default 'simple' check (template in ('simple','modern','creative')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolios_user_id_idx on public.portfolios(user_id);
create index if not exists portfolios_updated_at_idx on public.portfolios(updated_at desc);

alter table public.portfolios enable row level security;

drop policy if exists "Users can view their own portfolios" on public.portfolios;
create policy "Users can view their own portfolios"
  on public.portfolios for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own portfolios" on public.portfolios;
create policy "Users can create their own portfolios"
  on public.portfolios for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own portfolios" on public.portfolios;
create policy "Users can update their own portfolios"
  on public.portfolios for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own portfolios" on public.portfolios;
create policy "Users can delete their own portfolios"
  on public.portfolios for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.portfolios to authenticated;

-- Important: no public/anon CRUD policies are created. Users must sign in.
-- The app stores long-form list fields as text for a simple student project.
