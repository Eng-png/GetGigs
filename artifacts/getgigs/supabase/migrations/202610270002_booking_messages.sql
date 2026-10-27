-- Allow active artists and bookers to find public booking contacts and message
-- across roles without exposing private profile or authentication information.

create or replace function public.list_booking_contacts()
returns table (
  user_id uuid,
  role text,
  name text,
  subtitle text,
  description text,
  image_url text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  caller_role public.app_role;
begin
  select profile.role into caller_role
  from public.profiles profile
  where profile.id = caller_id and profile.account_status = 'active';

  if caller_role not in ('artist'::public.app_role, 'booker'::public.app_role) then
    raise exception 'An active artist or booker account is required';
  end if;

  return query
  select
    directory.user_id,
    'artist'::text,
    directory.artist_name,
    concat_ws(' · ', nullif(directory.artist_type, ''), nullif(concat_ws(', ', nullif(directory.city, ''), nullif(directory.region, '')), '')),
    directory.bio,
    coalesce(nullif(directory.profile_photo_url, ''), directory.cover_photo_url, '')
  from public.artist_directory directory
  join public.profiles profile on profile.id = directory.user_id
  where directory.is_published
    and profile.account_status = 'active'
    and directory.user_id <> caller_id

  union all

  select
    booker.user_id,
    'booker'::text,
    coalesce(nullif(booker.organization_name, ''), nullif(booker.contact_name, ''), 'Booker'),
    concat_ws(' · ', nullif(booker.venue_type, ''), nullif(booker.location, '')),
    booker.description,
    coalesce(booker.logo_url, '')
  from public.booker_profiles booker
  join public.profiles profile on profile.id = booker.user_id
  where caller_role = 'artist'::public.app_role
    and booker.profile_status = 'complete'
    and profile.account_status = 'active'
    and booker.user_id <> caller_id

  order by name;
end;
$$;

revoke all on function public.list_booking_contacts() from public;
grant execute on function public.list_booking_contacts() to authenticated;

create or replace function public.send_artist_message(recipient_id_input uuid, body_input text)
returns public.artist_messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  caller_role public.app_role;
  recipient_role public.app_role;
  conversation_id uuid;
  message_row public.artist_messages;
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  if caller_id = recipient_id_input then raise exception 'You cannot message yourself'; end if;
  if length(trim(coalesce(body_input, ''))) = 0 then raise exception 'Message cannot be empty'; end if;
  if length(body_input) > 2000 then raise exception 'Message is too long'; end if;

  select role into caller_role
  from public.profiles
  where id = caller_id and account_status = 'active';

  select role into recipient_role
  from public.profiles
  where id = recipient_id_input and account_status = 'active';

  if caller_role not in ('artist'::public.app_role, 'booker'::public.app_role) then
    raise exception 'Only active artist and booker accounts can send messages';
  end if;
  if recipient_role is null then raise exception 'That account is not available for messages'; end if;
  if caller_role = 'booker'::public.app_role and recipient_role <> 'artist'::public.app_role then
    raise exception 'Bookers can message artists';
  end if;
  if recipient_role = 'artist'::public.app_role and not exists (
    select 1 from public.artist_directory
    where user_id = recipient_id_input and is_published
  ) then raise exception 'That artist is not available for messages'; end if;
  if recipient_role = 'booker'::public.app_role and (
    caller_role <> 'artist'::public.app_role or not exists (
      select 1 from public.booker_profiles
      where user_id = recipient_id_input and profile_status = 'complete'
    )
  ) then raise exception 'That booker is not available for messages'; end if;

  insert into public.artist_conversations (participant_a, participant_b)
  values (caller_id, recipient_id_input)
  on conflict ((least(participant_a, participant_b)), (greatest(participant_a, participant_b))) do update
    set updated_at = now()
  returning id into conversation_id;

  insert into public.artist_messages (conversation_id, sender_id, body)
  values (conversation_id, caller_id, trim(body_input))
  returning * into message_row;

  update public.artist_conversations set updated_at = now() where id = conversation_id;
  return message_row;
end;
$$;

revoke all on function public.send_artist_message(uuid, text) from public;
grant execute on function public.send_artist_message(uuid, text) to authenticated;
