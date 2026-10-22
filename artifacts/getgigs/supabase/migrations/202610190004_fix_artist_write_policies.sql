-- Make artist self-service writes depend on the authenticated user's own id
-- and verified artist role, without relying on a nested role helper call.

drop policy if exists artist_profiles_insert on public.artist_profiles;
create policy artist_profiles_insert on public.artist_profiles for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'artist'::public.app_role
    )
  );

drop policy if exists artist_profiles_update on public.artist_profiles;
create policy artist_profiles_update on public.artist_profiles for update to authenticated
  using ((select auth.uid()) = user_id or public.current_user_role() = 'admin')
  with check ((select auth.uid()) = user_id or public.current_user_role() = 'admin');

drop policy if exists artist_directory_insert on public.artist_directory;
create policy artist_directory_insert on public.artist_directory for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'artist'::public.app_role
    )
  );

drop policy if exists artist_directory_update on public.artist_directory;
create policy artist_directory_update on public.artist_directory for update to authenticated
  using ((select auth.uid()) = user_id or public.current_user_role() = 'admin')
  with check ((select auth.uid()) = user_id or public.current_user_role() = 'admin');

drop policy if exists user_preferences_owner on public.user_preferences;
create policy user_preferences_owner on public.user_preferences for all to authenticated
  using ((select auth.uid()) = user_id or public.current_user_role() = 'admin')
  with check ((select auth.uid()) = user_id or public.current_user_role() = 'admin');

drop policy if exists profile_media_insert on storage.objects;
create policy profile_media_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
