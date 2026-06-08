-- TicTide Family Sync schema for Supabase.
-- Run this in the Supabase SQL editor after creating a project.
-- It stores child health-related data, so keep RLS enabled and review privacy obligations before production use.

create extension if not exists pgcrypto;

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  parent_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id)
);

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  display_name text not null,
  local_profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id),
  constraint children_id_family_unique unique (id, family_id)
);

create table if not exists public.tic_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  local_id text not null,
  created_at timestamptz not null,
  tic_name text not null,
  tic_type text not null check (tic_type in ('Motor', 'Vocal')),
  intensity integer not null check (intensity between 1 and 10),
  urge integer not null check (urge between 1 and 10),
  pain text,
  contexts text[] not null default '{}',
  note text,
  synced_at timestamptz not null default now(),
  unique (child_id, local_id),
  constraint tic_logs_child_family_fk foreign key (child_id, family_id) references public.children(id, family_id) on delete cascade
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  local_id text not null,
  created_at timestamptz not null,
  mood text not null,
  urge_before integer not null check (urge_before between 1 and 10),
  tic_pressure integer not null check (tic_pressure between 1 and 10),
  body_feeling text,
  trigger text,
  helped text,
  note text,
  synced_at timestamptz not null default now(),
  unique (child_id, local_id),
  constraint journal_entries_child_family_fk foreign key (child_id, family_id) references public.children(id, family_id) on delete cascade
);

create table if not exists public.care_snapshots (
  child_id uuid primary key references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  ygtss jsonb not null default '{}'::jsonb,
  puts jsonb not null default '{}'::jsonb,
  meds jsonb not null default '[]'::jsonb,
  red_flags jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint care_snapshots_child_family_fk foreign key (child_id, family_id) references public.children(id, family_id) on delete cascade
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'children_id_family_unique'
  ) then
    alter table public.children
      add constraint children_id_family_unique unique (id, family_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tic_logs_child_family_fk'
  ) then
    alter table public.tic_logs
      add constraint tic_logs_child_family_fk foreign key (child_id, family_id) references public.children(id, family_id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'journal_entries_child_family_fk'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_child_family_fk foreign key (child_id, family_id) references public.children(id, family_id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'care_snapshots_child_family_fk'
  ) then
    alter table public.care_snapshots
      add constraint care_snapshots_child_family_fk foreign key (child_id, family_id) references public.children(id, family_id) on delete cascade;
  end if;
end $$;

alter table public.families enable row level security;
alter table public.children enable row level security;
alter table public.tic_logs enable row level security;
alter table public.journal_entries enable row level security;
alter table public.care_snapshots enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.families to authenticated;
grant select, insert, update, delete on public.children to authenticated;
grant select, insert, update, delete on public.tic_logs to authenticated;
grant select, insert, update, delete on public.journal_entries to authenticated;
grant select, insert, update, delete on public.care_snapshots to authenticated;

drop policy if exists "Families are owned by the signed-in parent" on public.families;
create policy "Families are owned by the signed-in parent"
on public.families
for all
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

drop policy if exists "Children belong to the signed-in parent family" on public.children;
create policy "Children belong to the signed-in parent family"
on public.children
for all
to authenticated
using (
  exists (
    select 1 from public.families
    where families.id = children.family_id
      and families.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.families
    where families.id = children.family_id
      and families.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "Tic logs belong to the signed-in parent family" on public.tic_logs;
create policy "Tic logs belong to the signed-in parent family"
on public.tic_logs
for all
to authenticated
using (
  exists (
    select 1 from public.families
    where families.id = tic_logs.family_id
      and families.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.families
    where families.id = tic_logs.family_id
      and families.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "Journal entries belong to the signed-in parent family" on public.journal_entries;
create policy "Journal entries belong to the signed-in parent family"
on public.journal_entries
for all
to authenticated
using (
  exists (
    select 1 from public.families
    where families.id = journal_entries.family_id
      and families.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.families
    where families.id = journal_entries.family_id
      and families.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "Care snapshots belong to the signed-in parent family" on public.care_snapshots;
create policy "Care snapshots belong to the signed-in parent family"
on public.care_snapshots
for all
to authenticated
using (
  exists (
    select 1 from public.families
    where families.id = care_snapshots.family_id
      and families.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.families
    where families.id = care_snapshots.family_id
      and families.owner_user_id = (select auth.uid())
  )
);
