-- QLCT username/password auth and cloud sync.
-- Run this in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.qlct_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.qlct_sessions (
  token_hash text primary key,
  user_id uuid not null references public.qlct_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '90 days'
);

create table if not exists public.qlct_app_states (
  user_id uuid primary key references public.qlct_users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists qlct_app_states_updated_at_idx
  on public.qlct_app_states (updated_at desc);

create index if not exists qlct_sessions_user_id_idx
  on public.qlct_sessions (user_id);

alter table public.qlct_users enable row level security;
alter table public.qlct_sessions enable row level security;
alter table public.qlct_app_states enable row level security;

revoke all on public.qlct_users from anon, authenticated;
revoke all on public.qlct_sessions from anon, authenticated;
revoke all on public.qlct_app_states from anon, authenticated;

create or replace function public.qlct_token_hash(session_token text)
returns text
language sql
immutable
as $$
  select encode(digest(coalesce(session_token, ''), 'sha256'), 'hex')
$$;

create or replace function public.qlct_user_for_session(session_token text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select session_row.user_id
  from public.qlct_sessions session_row
  where session_row.token_hash = public.qlct_token_hash(session_token)
    and session_row.expires_at > now()
  limit 1
$$;

create or replace function public.qlct_register_user(user_name text, user_password text)
returns table(user_id uuid, username text, session_token text)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text := lower(regexp_replace(coalesce(user_name, ''), '[^a-z0-9._-]', '', 'g'));
  new_user_id uuid;
  raw_token text := encode(gen_random_bytes(32), 'hex');
begin
  if length(normalized) < 3 then
    raise exception 'Username must be at least 3 characters';
  end if;
  if length(coalesce(user_password, '')) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  insert into public.qlct_users (username, password_hash)
  values (normalized, crypt(user_password, gen_salt('bf')))
  returning id into new_user_id;

  insert into public.qlct_sessions (token_hash, user_id)
  values (public.qlct_token_hash(raw_token), new_user_id);

  return query select new_user_id, normalized, raw_token;
exception
  when unique_violation then
    raise exception 'Username already exists';
end;
$$;

create or replace function public.qlct_login_user(user_name text, user_password text)
returns table(user_id uuid, username text, session_token text)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text := lower(regexp_replace(coalesce(user_name, ''), '[^a-z0-9._-]', '', 'g'));
  found_user_id uuid;
  found_username text;
  found_password_hash text;
  raw_token text := encode(gen_random_bytes(32), 'hex');
begin
  select id, qlct_users.username, password_hash
  into found_user_id, found_username, found_password_hash
  from public.qlct_users
  where qlct_users.username = normalized
  limit 1;

  if found_user_id is null or found_password_hash <> crypt(coalesce(user_password, ''), found_password_hash) then
    raise exception 'Username or password is incorrect';
  end if;

  insert into public.qlct_sessions (token_hash, user_id)
  values (public.qlct_token_hash(raw_token), found_user_id);

  return query select found_user_id, found_username, raw_token;
end;
$$;

create or replace function public.qlct_logout_user(session_token text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.qlct_sessions
  where token_hash = public.qlct_token_hash(session_token)
$$;

create or replace function public.qlct_get_session_state(session_token text)
returns table(state jsonb, updated_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select app_state.state, app_state.updated_at
  from public.qlct_app_states app_state
  where app_state.user_id = public.qlct_user_for_session(session_token)
  limit 1
$$;

create or replace function public.qlct_upsert_session_state(
  session_token text,
  app_state jsonb,
  saved_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.qlct_user_for_session(session_token);
begin
  if current_user_id is null then
    raise exception 'Login session has expired';
  end if;

  insert into public.qlct_app_states (user_id, state, updated_at)
  values (current_user_id, coalesce(app_state, '{}'::jsonb), coalesce(saved_at, now()))
  on conflict (user_id) do update
    set state = excluded.state,
        updated_at = excluded.updated_at;
end;
$$;

grant execute on function public.qlct_register_user(text, text) to anon;
grant execute on function public.qlct_login_user(text, text) to anon;
grant execute on function public.qlct_logout_user(text) to anon;
grant execute on function public.qlct_get_session_state(text) to anon;
grant execute on function public.qlct_upsert_session_state(text, jsonb, timestamptz) to anon;
