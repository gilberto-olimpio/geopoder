-- GeoPoder Alpha 2.0a — schema, RLS e Realtime
-- Executar no SQL Editor do Supabase.

create extension if not exists pgcrypto;

create table if not exists public.gp_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  teacher_user_id uuid not null,
  class_name text,
  status text not null default 'lobby' check (status in ('lobby','active','finished')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  ended_at timestamptz
);

create table if not exists public.gp_room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.gp_rooms(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('teacher','player')),
  team_name text,
  country text check (country in ('Aurora','Montária','Pacífica','Solária')),
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique(room_id, user_id)
);

create unique index if not exists gp_room_country_unique
  on public.gp_room_players(room_id, country)
  where role='player' and country is not null;

create table if not exists public.gp_matches (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null unique references public.gp_rooms(id) on delete cascade,
  status text not null default 'active' check (status in ('active','finished')),
  round integer not null default 1,
  phase text not null default 'setup',
  active_country text,
  public_state jsonb not null default '{}'::jsonb,
  version bigint not null default 1,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.gp_player_private_state (
  match_id uuid not null references public.gp_matches(id) on delete cascade,
  player_id uuid not null references public.gp_room_players(id) on delete cascade,
  country text not null,
  hand jsonb not null default '[]'::jsonb,
  pending jsonb,
  advantages integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key(match_id, player_id)
);

-- Estado autoritativo: SEM permissões para clientes.
create table if not exists public.gp_server_match_state (
  match_id uuid primary key references public.gp_matches(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.gp_telemetry_events (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.gp_rooms(id) on delete cascade,
  match_id uuid references public.gp_matches(id) on delete cascade,
  actor_player_id uuid references public.gp_room_players(id) on delete set null,
  actor_country text,
  event_type text not null,
  round integer,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists gp_telemetry_room_idx on public.gp_telemetry_events(room_id, created_at);
create index if not exists gp_telemetry_match_idx on public.gp_telemetry_events(match_id, created_at);

-- RLS
alter table public.gp_rooms enable row level security;
alter table public.gp_room_players enable row level security;
alter table public.gp_matches enable row level security;
alter table public.gp_player_private_state enable row level security;
alter table public.gp_telemetry_events enable row level security;
alter table public.gp_server_match_state enable row level security;

-- Somente leitura direta para clientes autenticados. Escritas passam pela Edge Function.
revoke all on public.gp_rooms from anon, authenticated;
revoke all on public.gp_room_players from anon, authenticated;
revoke all on public.gp_matches from anon, authenticated;
revoke all on public.gp_player_private_state from anon, authenticated;
revoke all on public.gp_telemetry_events from anon, authenticated;
revoke all on public.gp_server_match_state from anon, authenticated;

grant select on public.gp_rooms to authenticated;
grant select on public.gp_room_players to authenticated;
grant select on public.gp_matches to authenticated;
grant select on public.gp_player_private_state to authenticated;
grant select on public.gp_telemetry_events to authenticated;

-- Helpers SECURITY DEFINER evitam recursão de RLS ao consultar a própria tabela de participantes.
create or replace function public.gp_is_room_member(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.gp_room_players p
    where p.room_id = p_room_id and p.user_id = auth.uid()
  );
$$;

create or replace function public.gp_is_room_teacher(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.gp_room_players p
    where p.room_id = p_room_id and p.user_id = auth.uid() and p.role = 'teacher'
  );
$$;

grant execute on function public.gp_is_room_member(uuid) to authenticated;
grant execute on function public.gp_is_room_teacher(uuid) to authenticated;

-- Sala: só membros da sala podem ler.
drop policy if exists "gp_rooms_members_read" on public.gp_rooms;
create policy "gp_rooms_members_read"
on public.gp_rooms for select to authenticated
using (public.gp_is_room_member(id));

-- Participantes: membros da mesma sala podem ver o roster.
drop policy if exists "gp_players_same_room_read" on public.gp_room_players;
create policy "gp_players_same_room_read"
on public.gp_room_players for select to authenticated
using (public.gp_is_room_member(room_id));

-- Estado público: membros da sala podem ler.
drop policy if exists "gp_matches_members_read" on public.gp_matches;
create policy "gp_matches_members_read"
on public.gp_matches for select to authenticated
using (public.gp_is_room_member(room_id));

-- Estado privado: próprio jogador OU professor da mesma sala.
drop policy if exists "gp_private_owner_or_teacher_read" on public.gp_player_private_state;
create policy "gp_private_owner_or_teacher_read"
on public.gp_player_private_state for select to authenticated
using (
  exists (
    select 1
    from public.gp_room_players target
    join public.gp_matches m on m.id = gp_player_private_state.match_id
    where target.id = gp_player_private_state.player_id
      and (
        target.user_id = auth.uid()
        or public.gp_is_room_teacher(m.room_id)
      )
  )
);

-- Telemetria: somente professor da sala.
drop policy if exists "gp_telemetry_teacher_read" on public.gp_telemetry_events;
create policy "gp_telemetry_teacher_read"
on public.gp_telemetry_events for select to authenticated
using (public.gp_is_room_teacher(room_id));

-- gp_server_match_state permanece sem policy e sem grants: somente secret/service role.

-- Realtime. Se já estiverem adicionadas à publicação, os blocos abaixo ignoram duplicate_object.
do $$ begin
  alter publication supabase_realtime add table public.gp_rooms;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.gp_room_players;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.gp_matches;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.gp_player_private_state;
exception when duplicate_object then null; end $$;
