-- GetGigs authentication, profile persistence, role authorization, and storage.
-- Run this migration in the Supabase SQL editor before enabling production auth.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('artist', 'booker', 'admin');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'artist',
  email text not null,
  display_name text not null default '',
  profile_photo_url text not null default '',
  city text not null default '',
  state text not null default '',
  country text not null default '',
  account_status text not null default 'active' check (account_status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artist_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  profile_data jsonb not null default '{}'::jsonb,
  profile_completion integer not null default 0 check (profile_completion between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Only deliberately public artist fields live here. Private emails, phone numbers,
-- riders, and account data stay in artist_profiles and are never guest-readable.
create table if not exists public.artist_directory (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  artist_name text not null default '',
  artist_type text not null default '',
  city text not null default '',
  region text not null default '',
  genres text[] not null default '{}',
  bio text not null default '',
  profile_photo_url text not null default '',
  cover_photo_url text not null default '',
  website text not null default '',
  spotify_url text not null default '',
  youtube_url text not null default '',
  instagram_url text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booker_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  organization_name text not null default '',
  contact_name text not null default '',
  website text not null default '',
  location text not null default '',
  venue_type text not null default '',
  capacity text not null default '',
  genres text[] not null default '{}',
  description text not null default '',
  logo_url text not null default '',
  profile_status text not null default 'draft' check (profile_status in ('draft', 'complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_venues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  venue_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, venue_id)
);

create table if not exists public.saved_artists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  artist_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, artist_user_id),
  check (user_id <> artist_user_id)
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  preferred_genres text[] not null default '{}',
  preferred_city text not null default '',
  preferred_radius text not null default '',
  preferred_capacity text not null default '',
  preferred_gig_types text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  search_query text not null default '',
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.venues (
  id text primary key,
  public_data jsonb not null,
  is_demo boolean not null default false,
  is_verified boolean not null default false,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Booking contacts are deliberately separated from the public venue record so
-- unauthenticated API requests cannot retrieve private contact fields.
create table if not exists public.venue_private_details (
  venue_id text primary key references public.venues(id) on delete cascade,
  booking_info jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  organization_name text not null default '',
  location text not null default '',
  description text not null default '',
  genres text[] not null default '{}',
  compensation text not null default '',
  event_date date,
  status text not null default 'draft' check (status in ('draft', 'open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null default '',
  message text not null default '',
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  subject_type text not null,
  subject_id text not null,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists saved_venues_user_id_idx on public.saved_venues(user_id);
create index if not exists saved_artists_user_id_idx on public.saved_artists(user_id);
create index if not exists search_history_user_id_idx on public.search_history(user_id, created_at desc);
create index if not exists opportunities_owner_id_idx on public.opportunities(owner_id);
create index if not exists artist_directory_genres_idx on public.artist_directory using gin(genres);

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.current_user_role() to anon;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested public.app_role;
begin
  requested := case
    when new.raw_user_meta_data ->> 'requested_role' = 'booker' then 'booker'::public.app_role
    else 'artist'::public.app_role
  end;

  insert into public.profiles (id, role, email, display_name)
  values (
    new.id,
    requested,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  );

  if requested = 'artist' then
    insert into public.artist_profiles (user_id) values (new.id);
    insert into public.artist_directory (user_id, artist_name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  else
    insert into public.booker_profiles (user_id, contact_name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  end if;

  insert into public.user_preferences (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
     and (old.role is distinct from new.role or old.account_status is distinct from new.account_status or old.email is distinct from new.email)
     and coalesce(public.current_user_role()::text, '') <> 'admin' then
    raise exception 'Only an administrator can change roles, account status, or the stored account email';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
  before update on public.profiles
  for each row execute procedure public.protect_profile_privileges();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$ begin new.updated_at = now(); return new; end; $$;

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','artist_profiles','artist_directory','booker_profiles','user_preferences','venues','venue_private_details','opportunities']
  loop
    execute format('drop trigger if exists touch_updated_at on public.%I', table_name);
    execute format('create trigger touch_updated_at before update on public.%I for each row execute procedure public.touch_updated_at()', table_name);
  end loop;
end $$;

alter table public.profiles enable row level security;
alter table public.artist_profiles enable row level security;
alter table public.artist_directory enable row level security;
alter table public.booker_profiles enable row level security;
alter table public.saved_venues enable row level security;
alter table public.saved_artists enable row level security;
alter table public.user_preferences enable row level security;
alter table public.search_history enable row level security;
alter table public.venues enable row level security;
alter table public.venue_private_details enable row level security;
alter table public.opportunities enable row level security;
alter table public.contact_requests enable row level security;
alter table public.reports enable row level security;

revoke all on public.profiles, public.artist_profiles, public.artist_directory, public.booker_profiles,
  public.saved_venues, public.saved_artists, public.user_preferences, public.search_history,
  public.venues, public.venue_private_details, public.opportunities, public.contact_requests, public.reports from anon, authenticated;
grant select on public.artist_directory, public.venues, public.opportunities to anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.artist_profiles, public.artist_directory, public.booker_profiles,
  public.saved_venues, public.saved_artists, public.user_preferences, public.search_history,
  public.venues, public.venue_private_details, public.opportunities, public.contact_requests, public.reports to authenticated;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using ((select auth.uid()) = id or public.current_user_role() = 'admin');
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id and role in ('artist', 'booker'));
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using ((select auth.uid()) = id or public.current_user_role() = 'admin')
  with check ((select auth.uid()) = id or public.current_user_role() = 'admin');

drop policy if exists artist_profiles_select on public.artist_profiles;
create policy artist_profiles_select on public.artist_profiles for select to authenticated
  using ((select auth.uid()) = user_id or public.current_user_role() = 'admin');
drop policy if exists artist_profiles_insert on public.artist_profiles;
create policy artist_profiles_insert on public.artist_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id and public.current_user_role() = 'artist');
drop policy if exists artist_profiles_update on public.artist_profiles;
create policy artist_profiles_update on public.artist_profiles for update to authenticated
  using ((select auth.uid()) = user_id or public.current_user_role() = 'admin')
  with check ((select auth.uid()) = user_id or public.current_user_role() = 'admin');

drop policy if exists artist_directory_public_read on public.artist_directory;
create policy artist_directory_public_read on public.artist_directory for select to anon, authenticated
  using (is_published or (select auth.uid()) = user_id or public.current_user_role() = 'admin');
drop policy if exists artist_directory_insert on public.artist_directory;
create policy artist_directory_insert on public.artist_directory for insert to authenticated
  with check ((select auth.uid()) = user_id and public.current_user_role() = 'artist');
drop policy if exists artist_directory_update on public.artist_directory;
create policy artist_directory_update on public.artist_directory for update to authenticated
  using ((select auth.uid()) = user_id or public.current_user_role() = 'admin')
  with check ((select auth.uid()) = user_id or public.current_user_role() = 'admin');

drop policy if exists booker_profiles_select on public.booker_profiles;
create policy booker_profiles_select on public.booker_profiles for select to authenticated
  using ((select auth.uid()) = user_id or public.current_user_role() = 'admin');
drop policy if exists booker_profiles_insert on public.booker_profiles;
create policy booker_profiles_insert on public.booker_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id and public.current_user_role() = 'booker');
drop policy if exists booker_profiles_update on public.booker_profiles;
create policy booker_profiles_update on public.booker_profiles for update to authenticated
  using ((select auth.uid()) = user_id or public.current_user_role() = 'admin')
  with check ((select auth.uid()) = user_id or public.current_user_role() = 'admin');

drop policy if exists saved_venues_owner on public.saved_venues;
create policy saved_venues_owner on public.saved_venues for all to authenticated
  using ((select auth.uid()) = user_id or public.current_user_role() = 'admin')
  with check ((select auth.uid()) = user_id);
drop policy if exists saved_artists_owner on public.saved_artists;
create policy saved_artists_owner on public.saved_artists for all to authenticated
  using ((select auth.uid()) = user_id or public.current_user_role() = 'admin')
  with check ((select auth.uid()) = user_id);
drop policy if exists user_preferences_owner on public.user_preferences;
create policy user_preferences_owner on public.user_preferences for all to authenticated
  using ((select auth.uid()) = user_id or public.current_user_role() = 'admin')
  with check ((select auth.uid()) = user_id);
drop policy if exists search_history_owner on public.search_history;
create policy search_history_owner on public.search_history for all to authenticated
  using ((select auth.uid()) = user_id or public.current_user_role() = 'admin')
  with check ((select auth.uid()) = user_id);

drop policy if exists venues_public_read on public.venues;
create policy venues_public_read on public.venues for select to anon, authenticated
  using (is_published or public.current_user_role() = 'admin');
drop policy if exists venues_admin_insert on public.venues;
create policy venues_admin_insert on public.venues for insert to authenticated
  with check (public.current_user_role() = 'admin');
drop policy if exists venues_admin_update on public.venues;
create policy venues_admin_update on public.venues for update to authenticated
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
drop policy if exists venues_admin_delete on public.venues;
create policy venues_admin_delete on public.venues for delete to authenticated
  using (public.current_user_role() = 'admin');

drop policy if exists venue_private_details_read on public.venue_private_details;
create policy venue_private_details_read on public.venue_private_details for select to authenticated
  using (public.current_user_role() in ('artist', 'admin'));
drop policy if exists venue_private_details_insert on public.venue_private_details;
create policy venue_private_details_insert on public.venue_private_details for insert to authenticated
  with check (public.current_user_role() = 'admin');
drop policy if exists venue_private_details_update on public.venue_private_details;
create policy venue_private_details_update on public.venue_private_details for update to authenticated
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
drop policy if exists venue_private_details_delete on public.venue_private_details;
create policy venue_private_details_delete on public.venue_private_details for delete to authenticated
  using (public.current_user_role() = 'admin');

drop policy if exists opportunities_read on public.opportunities;
create policy opportunities_read on public.opportunities for select to anon, authenticated
  using (status = 'open' or (select auth.uid()) = owner_id or public.current_user_role() = 'admin');
drop policy if exists opportunities_insert on public.opportunities;
create policy opportunities_insert on public.opportunities for insert to authenticated
  with check ((select auth.uid()) = owner_id and public.current_user_role() = 'booker');
drop policy if exists opportunities_update on public.opportunities;
create policy opportunities_update on public.opportunities for update to authenticated
  using ((select auth.uid()) = owner_id or public.current_user_role() = 'admin')
  with check ((select auth.uid()) = owner_id or public.current_user_role() = 'admin');
drop policy if exists opportunities_delete on public.opportunities;
create policy opportunities_delete on public.opportunities for delete to authenticated
  using ((select auth.uid()) = owner_id or public.current_user_role() = 'admin');

drop policy if exists contact_requests_participants on public.contact_requests;
create policy contact_requests_participants on public.contact_requests for select to authenticated
  using ((select auth.uid()) in (sender_id, recipient_id) or public.current_user_role() = 'admin');
drop policy if exists contact_requests_create on public.contact_requests;
create policy contact_requests_create on public.contact_requests for insert to authenticated
  with check ((select auth.uid()) = sender_id);
drop policy if exists contact_requests_update on public.contact_requests;
create policy contact_requests_update on public.contact_requests for update to authenticated
  using ((select auth.uid()) = recipient_id or public.current_user_role() = 'admin');

drop policy if exists reports_create on public.reports;
create policy reports_create on public.reports for insert to authenticated
  with check ((select auth.uid()) = reporter_id);
drop policy if exists reports_admin_read on public.reports;
create policy reports_admin_read on public.reports for select to authenticated
  using (public.current_user_role() = 'admin');
drop policy if exists reports_admin_update on public.reports;
create policy reports_admin_update on public.reports for update to authenticated
  using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

-- Admin views respect the caller's RLS (security_invoker) and never include passwords or tokens.
create or replace view public.admin_artist_overview
with (security_invoker = true)
as
select p.id, p.display_name as artist_name, p.email as account_email,
  ap.profile_data ->> 'bookingEmail' as booking_email,
  ap.profile_data ->> 'genre' as genres,
  concat_ws(', ', nullif(ap.profile_data ->> 'city', ''), nullif(ap.profile_data ->> 'region', '')) as city,
  ap.profile_completion, p.account_status, p.created_at, p.updated_at
from public.profiles p
join public.artist_profiles ap on ap.user_id = p.id
where p.role = 'artist' and public.current_user_role() = 'admin';

create or replace view public.admin_booker_overview
with (security_invoker = true)
as
select p.id, bp.organization_name, bp.contact_name, p.email,
  bp.location, bp.venue_type, bp.profile_status, p.account_status,
  p.created_at, p.updated_at
from public.profiles p
join public.booker_profiles bp on bp.user_id = p.id
where p.role = 'booker' and public.current_user_role() = 'admin';

grant select on public.admin_artist_overview, public.admin_booker_overview to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-media', 'profile-media', true, 52428800, array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('private-documents', 'private-documents', false, 20971520, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists profile_media_insert on storage.objects;
create policy profile_media_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'profile-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists profile_media_update on storage.objects;
create policy profile_media_update on storage.objects for update to authenticated
  using (bucket_id = 'profile-media' and owner_id = (select auth.uid())::text)
  with check (bucket_id = 'profile-media' and owner_id = (select auth.uid())::text);
drop policy if exists profile_media_delete on storage.objects;
create policy profile_media_delete on storage.objects for delete to authenticated
  using (bucket_id = 'profile-media' and owner_id = (select auth.uid())::text);

drop policy if exists private_documents_select on storage.objects;
create policy private_documents_select on storage.objects for select to authenticated
  using (bucket_id = 'private-documents' and (owner_id = (select auth.uid())::text or public.current_user_role() = 'admin'));
drop policy if exists private_documents_insert on storage.objects;
create policy private_documents_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'private-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists private_documents_update on storage.objects;
create policy private_documents_update on storage.objects for update to authenticated
  using (bucket_id = 'private-documents' and owner_id = (select auth.uid())::text)
  with check (bucket_id = 'private-documents' and owner_id = (select auth.uid())::text);
drop policy if exists private_documents_delete on storage.objects;
create policy private_documents_delete on storage.objects for delete to authenticated
  using (bucket_id = 'private-documents' and owner_id = (select auth.uid())::text);
