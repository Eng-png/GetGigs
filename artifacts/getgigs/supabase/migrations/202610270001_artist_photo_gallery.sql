-- Public artist photo gallery used by the Community profile swipe deck.

alter table public.artist_directory
  add column if not exists gallery_photo_urls text[] not null default '{}';

update public.artist_directory directory
set gallery_photo_urls = coalesce((
  select array_agg(photo)
  from public.artist_profiles profile,
       jsonb_array_elements_text(coalesce(profile.profile_data -> 'pressPhotoFiles', '[]'::jsonb)) photo
  where profile.user_id = directory.user_id
), '{}');

