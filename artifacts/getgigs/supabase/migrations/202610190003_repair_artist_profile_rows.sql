-- Repair artist accounts created before all profile child rows were provisioned.
-- The function is intentionally scoped to the authenticated caller.

create or replace function public.ensure_artist_profile_rows()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
begin
  if caller_id is null then
    raise exception 'Authentication is required';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = caller_id and role = 'artist'::public.app_role
  ) then
    raise exception 'Only artist accounts can repair artist profile rows';
  end if;

  insert into public.artist_profiles (user_id)
  values (caller_id)
  on conflict (user_id) do nothing;

  insert into public.artist_directory (user_id)
  values (caller_id)
  on conflict (user_id) do nothing;

  insert into public.user_preferences (user_id)
  values (caller_id)
  on conflict (user_id) do nothing;
end;
$$;

revoke all on function public.ensure_artist_profile_rows() from public;
grant execute on function public.ensure_artist_profile_rows() to authenticated;
