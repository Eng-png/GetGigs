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
begin
  if caller_id is null then
    raise exception 'Authentication is required';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = caller_id and role = 'artist'::public.app_role
  ) then
    raise exception 'Only artist accounts can save artist profiles';
  end if;

  insert into public.artist_profiles (user_id, profile_data, profile_completion)
  values (caller_id, saved, greatest(0, least(100, completion_input)))
  on conflict (user_id) do update set
    profile_data = excluded.profile_data,
    profile_completion = excluded.profile_completion,
    updated_at = now();

  insert into public.artist_directory (
    user_id, artist_name, artist_type, city, region, genres, bio,
    profile_photo_url, cover_photo_url, website, spotify_url,
    youtube_url, instagram_url, is_published
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
    coalesce(nullif(saved ->> 'name', ''), '') <> ''
  )
  on conflict (user_id) do update set
    artist_name = excluded.artist_name,
    artist_type = excluded.artist_type,
    city = excluded.city,
    region = excluded.region,
    genres = excluded.genres,
    bio = excluded.bio,
    profile_photo_url = excluded.profile_photo_url,
    cover_photo_url = excluded.cover_photo_url,
    website = excluded.website,
    spotify_url = excluded.spotify_url,
    youtube_url = excluded.youtube_url,
    instagram_url = excluded.instagram_url,
    is_published = excluded.is_published,
    updated_at = now();

  update public.profiles set
    display_name = coalesce(saved ->> 'name', ''),
    profile_photo_url = coalesce(saved ->> 'image', ''),
    city = coalesce(saved ->> 'city', ''),
    state = coalesce(saved ->> 'region', ''),
    country = coalesce(saved ->> 'country', ''),
    updated_at = now()
  where id = caller_id;

  insert into public.user_preferences (
    user_id, preferred_genres, preferred_city, preferred_radius,
    preferred_capacity, preferred_gig_types
  )
  values (
    caller_id,
    coalesce(genres_input, '{}'),
    coalesce(nullif(saved ->> 'preferredCities', ''), nullif(saved ->> 'city', ''), ''),
    coalesce(saved #>> '{preferences,travelRadius}', ''),
    coalesce(nullif(saved ->> 'preferredVenueCapacity', ''), saved #>> '{preferences,capacity}', ''),
    coalesce(array(select jsonb_array_elements_text(coalesce(saved #> '{preferences,gigTypes}', '[]'::jsonb))), '{}')
  )
  on conflict (user_id) do update set
    preferred_genres = excluded.preferred_genres,
    preferred_city = excluded.preferred_city,
    preferred_radius = excluded.preferred_radius,
    preferred_capacity = excluded.preferred_capacity,
    preferred_gig_types = excluded.preferred_gig_types,
    updated_at = now();

  return saved;
end;
$$;

revoke all on function public.save_artist_profile(jsonb, integer, text[]) from public;
grant execute on function public.save_artist_profile(jsonb, integer, text[]) to authenticated;
