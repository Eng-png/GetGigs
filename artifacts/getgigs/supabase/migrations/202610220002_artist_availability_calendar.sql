-- Normalized, privacy-aware gig availability for calendar editing and comparison.

alter table public.artist_directory
  add column if not exists availability_visibility text not null default 'private'
  check (availability_visibility in ('private', 'connections', 'public'));

create table if not exists public.artist_availability (
  id uuid primary key default gen_random_uuid(),
  artist_user_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'UTC',
  status text not null default 'available' check (status in ('available', 'tentative', 'unavailable')),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  unique (artist_user_id, starts_at, ends_at)
);

create index if not exists artist_availability_artist_dates_idx
  on public.artist_availability(artist_user_id, starts_at, ends_at);

alter table public.artist_availability enable row level security;
revoke all on public.artist_availability from anon, authenticated;
grant select on public.artist_availability to anon, authenticated;
grant insert, update, delete on public.artist_availability to authenticated;

drop policy if exists artist_availability_read_allowed on public.artist_availability;
create policy artist_availability_read_allowed
on public.artist_availability for select to anon, authenticated
using (
  exists (
    select 1
    from public.artist_directory directory
    where directory.user_id = artist_availability.artist_user_id
      and directory.is_published
      and (
        directory.availability_visibility = 'public'
        or (select auth.uid()) = artist_availability.artist_user_id
        or (
          directory.availability_visibility = 'connections'
          and (select auth.uid()) is not null
          and exists (
            select 1
            from public.artist_connections connection
            where connection.status = 'accepted'
              and (
                (connection.requester_id = (select auth.uid()) and connection.recipient_id = artist_availability.artist_user_id)
                or (connection.recipient_id = (select auth.uid()) and connection.requester_id = artist_availability.artist_user_id)
              )
          )
        )
      )
  )
);

drop policy if exists artist_availability_owner_insert on public.artist_availability;
create policy artist_availability_owner_insert
on public.artist_availability for insert to authenticated
with check (
  (select auth.uid()) = artist_user_id
  and exists (select 1 from public.profiles where id = artist_user_id and role = 'artist'::public.app_role and account_status = 'active')
);

drop policy if exists artist_availability_owner_update on public.artist_availability;
create policy artist_availability_owner_update
on public.artist_availability for update to authenticated
using ((select auth.uid()) = artist_user_id)
with check ((select auth.uid()) = artist_user_id);

drop policy if exists artist_availability_owner_delete on public.artist_availability;
create policy artist_availability_owner_delete
on public.artist_availability for delete to authenticated
using ((select auth.uid()) = artist_user_id);

create or replace function public.set_artist_availability_visibility(visibility_input text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  if visibility_input not in ('private', 'connections', 'public') then raise exception 'Invalid availability visibility'; end if;
  update public.artist_directory
  set availability_visibility = visibility_input,
      availability_public = visibility_input = 'public',
      updated_at = now()
  where user_id = caller_id;
  if not found then raise exception 'Artist directory profile not found'; end if;
  return visibility_input;
end;
$$;

revoke all on function public.set_artist_availability_visibility(text) from public;
grant execute on function public.set_artist_availability_visibility(text) to authenticated;

create or replace function public.touch_artist_availability_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists touch_artist_availability_updated_at on public.artist_availability;
create trigger touch_artist_availability_updated_at
before update on public.artist_availability
for each row execute procedure public.touch_artist_availability_updated_at();
