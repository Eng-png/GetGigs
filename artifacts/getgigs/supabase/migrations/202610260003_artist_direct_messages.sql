-- Persistent direct messages between active artist accounts.

create table if not exists public.artist_conversations (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid not null references public.profiles(id) on delete cascade,
  participant_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (participant_a <> participant_b)
);

create unique index if not exists artist_conversations_pair_idx
  on public.artist_conversations (least(participant_a, participant_b), greatest(participant_a, participant_b));

create table if not exists public.artist_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.artist_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists artist_messages_conversation_idx
  on public.artist_messages(conversation_id, created_at);

alter table public.artist_conversations enable row level security;
alter table public.artist_messages enable row level security;

revoke all on public.artist_conversations, public.artist_messages from anon, authenticated;
grant select on public.artist_conversations, public.artist_messages to authenticated;

drop policy if exists artist_conversations_participant_select on public.artist_conversations;
create policy artist_conversations_participant_select
on public.artist_conversations for select to authenticated
using ((select auth.uid()) in (participant_a, participant_b));

drop policy if exists artist_messages_participant_select on public.artist_messages;
create policy artist_messages_participant_select
on public.artist_messages for select to authenticated
using (
  exists (
    select 1
    from public.artist_conversations conversation
    where conversation.id = artist_messages.conversation_id
      and (select auth.uid()) in (conversation.participant_a, conversation.participant_b)
  )
);

create or replace function public.send_artist_message(recipient_id_input uuid, body_input text)
returns public.artist_messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  conversation_id uuid;
  message_row public.artist_messages;
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  if caller_id = recipient_id_input then raise exception 'You cannot message yourself'; end if;
  if length(trim(coalesce(body_input, ''))) = 0 then raise exception 'Message cannot be empty'; end if;
  if length(body_input) > 2000 then raise exception 'Message is too long'; end if;
  if not exists (
    select 1 from public.profiles
    where id = caller_id and role = 'artist'::public.app_role and account_status = 'active'
  ) then raise exception 'Only active artist accounts can send messages'; end if;
  if not exists (
    select 1
    from public.artist_directory
    where user_id = recipient_id_input and is_published
  ) then raise exception 'That artist is not available for messages'; end if;

  insert into public.artist_conversations (participant_a, participant_b)
  values (caller_id, recipient_id_input)
  on conflict ((least(participant_a, participant_b)), (greatest(participant_a, participant_b))) do update
    set updated_at = now()
  returning id into conversation_id;

  if conversation_id is null then
    select id into conversation_id
    from public.artist_conversations
    where least(participant_a, participant_b) = least(caller_id, recipient_id_input)
      and greatest(participant_a, participant_b) = greatest(caller_id, recipient_id_input);
  end if;

  insert into public.artist_messages (conversation_id, sender_id, body)
  values (conversation_id, caller_id, trim(body_input))
  returning * into message_row;

  update public.artist_conversations set updated_at = now() where id = conversation_id;
  return message_row;
end;
$$;

revoke all on function public.send_artist_message(uuid, text) from public;
grant execute on function public.send_artist_message(uuid, text) to authenticated;
