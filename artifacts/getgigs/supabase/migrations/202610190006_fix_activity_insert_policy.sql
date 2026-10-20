drop policy if exists admin_activity_insert_self on public.admin_activity;
create policy admin_activity_insert_self on public.admin_activity for insert to authenticated
  with check (
    (select auth.uid()) = actor_id
    and (subject_user_id is null or subject_user_id = (select auth.uid()) or public.current_user_role() = 'admin')
  );
