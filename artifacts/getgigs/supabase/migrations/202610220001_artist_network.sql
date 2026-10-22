-- Artist Network: public discovery fields and authenticated connection requests.

alter table public.artist_directory
  add column if not exists performer_count integer not null default 1,
  add column if not exists collaboration_interests text[] not null default '{}',
  add column if not exists availability_public boolean not null default false,
  add column if not exists next_available_dates text[] not null default '{}';

create table if not exists public.artist_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> recipient_id)
);

create unique index if not exists artist_connections_pair_idx
  on public.artist_connections (least(requester_id, recipient_id), greatest(requester_id, recipient_id));
create index if not exists artist_connections_requester_idx on public.artist_connections(requester_id, updated_at desc);
create index if not exists artist_connections_recipient_idx on public.artist_connections(recipient_id, updated_at desc);

alter table public.artist_connections enable row level security;
revoke all on public.artist_connections from anon, authenticated;
grant select on public.artist_connections to authenticated;

drop policy if exists artist_connections_select_participant on public.artist_connections;
create policy artist_connections_select_participant
on public.artist_connections for select to authenticated
using ((select auth.uid()) in (requester_id, recipient_id) or public.current_user_role() = 'admin');

create or replace function public.request_artist_connection(recipient_id_input uuid)
returns public.artist_connections
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  existing public.artist_connections;
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  if caller_id = recipient_id_input then raise exception 'You cannot connect with yourself'; end if;
  if not exists (select 1 from public.profiles where id = caller_id and role = 'artist'::public.app_role and account_status = 'active') then
    raise exception 'Only active artist accounts can send connection requests';
  end if;
  if not exists (select 1 from public.profiles where id = recipient_id_input and role = 'artist'::public.app_role and account_status = 'active') then
    raise exception 'That artist account is not available for connections';
  end if;

  select * into existing
  from public.artist_connections
  where least(requester_id, recipient_id) = least(caller_id, recipient_id_input)
    and greatest(requester_id, recipient_id) = greatest(caller_id, recipient_id_input)
  for update;

  if existing.id is not null and existing.status in ('pending', 'accepted') then
    return existing;
  end if;
  if existing.id is not null then
    update public.artist_connections
    set requester_id = caller_id, recipient_id = recipient_id_input, status = 'pending', updated_at = now()
    where id = existing.id
    returning * into existing;
    return existing;
  end if;

  insert into public.artist_connections (requester_id, recipient_id)
  values (caller_id, recipient_id_input)
  returning * into existing;
  return existing;
end;
$$;

create or replace function public.update_artist_connection(connection_id_input uuid, action_input text)
returns public.artist_connections
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  connection_row public.artist_connections;
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  select * into connection_row from public.artist_connections where id = connection_id_input for update;
  if connection_row.id is null then raise exception 'Connection request not found'; end if;

  if action_input = 'accept' and caller_id = connection_row.recipient_id and connection_row.status = 'pending' then
    update public.artist_connections set status = 'accepted', updated_at = now() where id = connection_row.id returning * into connection_row;
  elsif action_input = 'decline' and caller_id = connection_row.recipient_id and connection_row.status = 'pending' then
    update public.artist_connections set status = 'declined', updated_at = now() where id = connection_row.id returning * into connection_row;
  elsif action_input = 'cancel' and caller_id = connection_row.requester_id and connection_row.status = 'pending' then
    update public.artist_connections set status = 'cancelled', updated_at = now() where id = connection_row.id returning * into connection_row;
  else
    raise exception 'You are not allowed to perform that connection action';
  end if;
  return connection_row;
end;
$$;

revoke all on function public.request_artist_connection(uuid) from public;
grant execute on function public.request_artist_connection(uuid) to authenticated;
revoke all on function public.update_artist_connection(uuid, text) from public;
grant execute on function public.update_artist_connection(uuid, text) to authenticated;

create or replace function public.touch_artist_connection_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists touch_artist_connections_updated_at on public.artist_connections;
create trigger touch_artist_connections_updated_at before update on public.artist_connections
for each row execute procedure public.touch_artist_connection_updated_at();

create or replace function public.save_artist_profile(
  profile_input jsonb,
  completion_input integer,
  genres_input text[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  saved jsonb := profile_input;
  shared_dates text[] := coalesce(array(
    select concat_ws(' ', item ->> 'month', item ->> 'date')
    from jsonb_array_elements(coalesce(saved -> 'availability', '[]'::jsonb)) item
  ), '{}');
  interests text[] := coalesce(array(
    select trim(item)
    from unnest(string_to_array(coalesce(nullif(saved ->> 'networkInterests', ''), saved #>> '{preferences,compatibleArtists}', ''), ',')) item
    where trim(item) <> ''
  ), '{}');
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  if not exists (select 1 from public.profiles where id = caller_id and role = 'artist'::public.app_role) then
    raise exception 'Only artist accounts can save artist profiles';
  end if;

  insert into public.artist_profiles (user_id, profile_data, profile_completion)
  values (caller_id, saved, greatest(0, least(100, completion_input)))
  on conflict (user_id) do update set profile_data = excluded.profile_data, profile_completion = excluded.profile_completion, updated_at = now();

  insert into public.artist_directory (
    user_id, artist_name, artist_type, city, region, genres, bio,
    profile_photo_url, cover_photo_url, website, spotify_url,
    youtube_url, instagram_url, performer_count, collaboration_interests,
    availability_public, next_available_dates, is_published
  )
  values (
    caller_id,
    coalesce(saved ->> 'name', ''),
    coalesce(saved ->> 'artistType', ''),
    coalesce(saved ->> 'city', ''),
    coalesce(saved ->> 'region', ''),
    coalesce(genres_input, '{}'),
    coalesce(nullif(saved ->> 'oneLineBio', ''), saved ->> 'shortBio', ''),
    coalesce(saved ->> 'image', ''),
    coalesce(saved ->> 'bandImage', ''),
    coalesce(saved ->> 'website', ''),
    coalesce(saved ->> 'spotify', ''),
    coalesce(saved ->> 'youtube', ''),
    coalesce(saved ->> 'instagram', ''),
    greatest(1, case
      when coalesce(saved ->> 'performersCount', '') ~ '^[0-9]+$'
        then (saved ->> 'performersCount')::integer
      else 1
    end),
    interests,
    coalesce((saved ->> 'shareAvailability')::boolean, false),
    case when coalesce((saved ->> 'shareAvailability')::boolean, false) then shared_dates else '{}' end,
    coalesce(nullif(saved ->> 'name', ''), '') <> ''
  )
  on conflict (user_id) do update set
    artist_name = excluded.artist_name, artist_type = excluded.artist_type, city = excluded.city, region = excluded.region,
    genres = excluded.genres, bio = excluded.bio, profile_photo_url = excluded.profile_photo_url,
    cover_photo_url = excluded.cover_photo_url, website = excluded.website, spotify_url = excluded.spotify_url,
    youtube_url = excluded.youtube_url, instagram_url = excluded.instagram_url, performer_count = excluded.performer_count,
    collaboration_interests = excluded.collaboration_interests, availability_public = excluded.availability_public,
    next_available_dates = excluded.next_available_dates, is_published = excluded.is_published, updated_at = now();

  update public.profiles set display_name = coalesce(saved ->> 'name', ''), profile_photo_url = coalesce(saved ->> 'image', ''),
    city = coalesce(saved ->> 'city', ''), state = coalesce(saved ->> 'region', ''), country = coalesce(saved ->> 'country', ''), updated_at = now()
  where id = caller_id;

  insert into public.user_preferences (user_id, preferred_genres, preferred_city, preferred_radius, preferred_capacity, preferred_gig_types)
  values (
    caller_id, coalesce(genres_input, '{}'),
    coalesce(nullif(saved ->> 'preferredCities', ''), nullif(saved ->> 'city', ''), ''),
    coalesce(saved #>> '{preferences,travelRadius}', ''),
    coalesce(nullif(saved ->> 'preferredVenueCapacity', ''), saved #>> '{preferences,capacity}', ''),
    coalesce(array(select jsonb_array_elements_text(coalesce(saved #> '{preferences,gigTypes}', '[]'::jsonb))), '{}')
  )
  on conflict (user_id) do update set preferred_genres = excluded.preferred_genres, preferred_city = excluded.preferred_city,
    preferred_radius = excluded.preferred_radius, preferred_capacity = excluded.preferred_capacity,
    preferred_gig_types = excluded.preferred_gig_types, updated_at = now();

  return saved;
end;
$$;

revoke all on function public.save_artist_profile(jsonb, integer, text[]) from public;
grant execute on function public.save_artist_profile(jsonb, integer, text[]) to authenticated;
