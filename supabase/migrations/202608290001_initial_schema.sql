-- ApplyTracker initial schema

create type public.user_role as enum ('user', 'admin');
-- 値は英字キーで保存し、日本語の表示名は画面側で変換する。
-- （日本語のまま保存すると URL の絞り込みが ?status=%E5%BF%9C... となり読めなくなるため）
create type public.application_platform as enum (
  'crowdworks',
  'lancers',
  'coconala',
  'other'
);
create type public.application_status as enum (
  'considering',
  'applied',
  'replied',
  'contracted',
  'rejected',
  'passed'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  platform public.application_platform not null,
  title text not null check (length(btrim(title)) > 0),
  listing_url text,
  listed_amount_text text,
  actual_amount numeric check (actual_amount >= 0),
  applicant_count integer check (applicant_count >= 0),
  client_rating numeric check (client_rating between 0 and 5),
  client_completion_rate numeric check (client_completion_rate between 0 and 100),
  deadline date,
  status public.application_status not null default 'considering',
  proposal_text text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  actor_id uuid not null references auth.users (id) on delete restrict,
  action text not null check (length(btrim(action)) > 0),
  target_table text not null check (length(btrim(target_table)) > 0),
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index applications_owner_id_idx on public.applications (owner_id);
create index applications_owner_status_idx on public.applications (owner_id, status);
create index audit_logs_owner_created_at_idx on public.audit_logs (owner_id, created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.profiles force row level security;
alter table public.applications force row level security;
alter table public.audit_logs force row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "applications_select_own"
on public.applications for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "applications_insert_own"
on public.applications for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "applications_update_own"
on public.applications for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "applications_delete_own"
on public.applications for delete
to authenticated
using ((select auth.uid()) = owner_id);

create policy "audit_logs_select_own"
on public.audit_logs for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "audit_logs_insert_own"
on public.audit_logs for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
  and (select auth.uid()) = actor_id
);
