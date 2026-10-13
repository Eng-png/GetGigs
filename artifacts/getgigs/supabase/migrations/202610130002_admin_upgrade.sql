-- GetGigs admin content management, audit activity, and administrator media access.

create table if not exists public.site_content (
  content_key text primary key,
  content_value text not null default '',
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_activity (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  subject_user_id uuid references public.profiles(id) on delete set null,
  activity_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_created_at_idx on public.admin_activity(created_at desc);
create index if not exists admin_activity_subject_user_idx on public.admin_activity(subject_user_id, created_at desc);

alter table public.site_content enable row level security;
alter table public.admin_activity enable row level security;

revoke all on public.site_content, public.admin_activity from anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant select, insert, update, delete on public.admin_activity to authenticated;
grant insert, update, delete on public.site_content to authenticated;

drop policy if exists site_content_public_read on public.site_content;
create policy site_content_public_read on public.site_content for select to anon, authenticated
  using (true);
drop policy if exists site_content_admin_write on public.site_content;
create policy site_content_admin_write on public.site_content for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists admin_activity_admin_read on public.admin_activity;
create policy admin_activity_admin_read on public.admin_activity for select to authenticated
  using (public.current_user_role() = 'admin');
drop policy if exists admin_activity_insert_self on public.admin_activity;
create policy admin_activity_insert_self on public.admin_activity for insert to authenticated
  with check ((select auth.uid()) = actor_id);
drop policy if exists admin_activity_admin_update on public.admin_activity;
create policy admin_activity_admin_update on public.admin_activity for update to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
drop policy if exists admin_activity_admin_delete on public.admin_activity;
create policy admin_activity_admin_delete on public.admin_activity for delete to authenticated
  using (public.current_user_role() = 'admin');

-- Administrators may manage public profile media without granting those rights to other users.
drop policy if exists profile_media_admin_insert on storage.objects;
create policy profile_media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'profile-media' and public.current_user_role() = 'admin');
drop policy if exists profile_media_admin_update on storage.objects;
create policy profile_media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'profile-media' and public.current_user_role() = 'admin')
  with check (bucket_id = 'profile-media' and public.current_user_role() = 'admin');
drop policy if exists profile_media_admin_delete on storage.objects;
create policy profile_media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'profile-media' and public.current_user_role() = 'admin');

insert into public.site_content (content_key, content_value)
values
  ('welcome.title', 'Find the right stage—or the right sound.'),
  ('welcome.description', 'Artists build one booking-ready profile and discover compatible rooms. Venues, promoters, and organizers discover artists ready to play.')
on conflict (content_key) do nothing;
