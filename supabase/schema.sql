-- QLCT cloud sync storage.
-- Run this once in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.qlct_app_states (
  sync_id_hash text primary key,
  user_id uuid unique,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.qlct_app_states
  add column if not exists user_id uuid;

create unique index if not exists qlct_app_states_user_id_idx
  on public.qlct_app_states (user_id)
  where user_id is not null;

create index if not exists qlct_app_states_updated_at_idx
  on public.qlct_app_states (updated_at desc);

alter table public.qlct_app_states enable row level security;

drop policy if exists "qlct anon read by sync id hash" on public.qlct_app_states;
drop policy if exists "qlct anon insert state" on public.qlct_app_states;
drop policy if exists "qlct anon update state" on public.qlct_app_states;

create or replace function public.qlct_sync_hash(sync_secret text)
returns text
language sql
immutable
as $$
  select encode(digest(coalesce(sync_secret, ''), 'sha256'), 'hex')
$$;

create or replace function public.qlct_get_state(sync_secret text)
returns table(state jsonb, updated_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select app_state.state, app_state.updated_at
  from public.qlct_app_states app_state
  where app_state.sync_id_hash = public.qlct_sync_hash(sync_secret)
  limit 1
$$;

create or replace function public.qlct_upsert_state(
  sync_secret text,
  app_state jsonb,
  saved_at timestamptz default now()
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.qlct_app_states (sync_id_hash, state, updated_at)
  values (public.qlct_sync_hash(sync_secret), coalesce(app_state, '{}'::jsonb), coalesce(saved_at, now()))
  on conflict (sync_id_hash) do update
    set state = excluded.state,
        updated_at = excluded.updated_at
$$;

create or replace function public.qlct_get_my_state()
returns table(state jsonb, updated_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select app_state.state, app_state.updated_at
  from public.qlct_app_states app_state
  where app_state.user_id = auth.uid()
  limit 1
$$;

create or replace function public.qlct_upsert_my_state(
  app_state jsonb,
  saved_at timestamptz default now()
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.qlct_app_states (sync_id_hash, user_id, state, updated_at)
  values ('user:' || auth.uid()::text, auth.uid(), coalesce(app_state, '{}'::jsonb), coalesce(saved_at, now()))
  on conflict (user_id) do update
    set state = excluded.state,
        updated_at = excluded.updated_at
$$;

revoke all on public.qlct_app_states from anon;
grant execute on function public.qlct_get_state(text) to anon;
grant execute on function public.qlct_upsert_state(text, jsonb, timestamptz) to anon;
grant execute on function public.qlct_get_my_state() to authenticated;
grant execute on function public.qlct_upsert_my_state(jsonb, timestamptz) to authenticated;
