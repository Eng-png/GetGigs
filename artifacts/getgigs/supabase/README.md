# GetGigs Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor**, paste `migrations/202610080001_getgigs_auth.sql`, and run it once.
3. Paste `migrations/202610220001_artist_network.sql` into a new SQL Editor query and run it after the base migration. GitHub Pages deploys frontend code only; it does not apply Supabase migrations.
4. Copy `.env.example` to `.env.local` and set the project URL and publishable key. Never use the `service_role` key in the browser app.
5. In **Authentication → URL Configuration**, set the Site URL and add the local/production reset-password redirect URLs.
6. Create the first account normally, then promote it in the SQL Editor:

```sql
update public.profiles
set role = 'admin', updated_at = now()
where email = 'YOUR_ACCOUNT_EMAIL';
```

Sign out and sign in again. The account will now open the admin workspace. There is intentionally no public admin signup path.

## Quick role test

1. Sign up once as **Artist** and once as **Looking for Artist** using two different email addresses.
2. Confirm each email if email confirmation is enabled.
3. Verify the artist account restores its profile and Saved venues after a refresh and sign-in.
4. Verify the booker account opens Discover Artists, Saved Artists, Post Opportunity, Contacts, and Profile.
5. Promote a third normal account with the SQL above, sign in again, and verify `/admin` opens the dashboard.
6. While signed out, or while using either normal account, open `/admin` directly and confirm access is denied or login is required.

The sample venue cards remain bundled as clearly marked demo records. New admin-created venues are stored in `venues`; their private booking contacts are stored separately in `venue_private_details` so guest API requests cannot retrieve them.

## Admin upgrade

After applying `202610130002_admin_upgrade.sql`, deploy the account deletion function from the repository root:

```bash
supabase functions deploy delete-user
```

The function requires Supabase's managed `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets. Never place the service-role key in a `VITE_` environment variable or in browser code.

The administrator workspace then provides private site-content editing, venue management, artist profile/media editing, user status/edit/delete controls, and an activity audit view. Only profiles whose database role is `admin` can use these operations.

## Artist Network migration verification

After running `202610220001_artist_network.sql`, verify the schema and policies in the real Supabase project:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'artist_directory'
  and column_name in ('performer_count', 'collaboration_interests', 'availability_public', 'next_available_dates')
order by column_name;

select to_regclass('public.artist_connections') as artist_connections_table,
       to_regclass('public.artist_connections_pair_idx') as pair_index;

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'artist_connections';

select routine_name, routine_schema
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('request_artist_connection', 'update_artist_connection', 'save_artist_profile');
```

The application must not be considered production-ready for connections until these checks succeed. Test with two real artist accounts: browse while signed out, send one request while signed in, confirm a duplicate request does not create another row, then accept, decline, and cancel from the appropriate account.

## Availability calendar migration

Run `migrations/202610220002_artist_availability_calendar.sql` manually in the Supabase SQL Editor after the Artist Network migration. GitHub Pages only deploys the frontend and never applies database migrations.

Verify the calendar objects:

```sql
select to_regclass('public.artist_availability') as availability_table;

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'artist_availability'
order by ordinal_position;

select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'artist_directory'
  and column_name = 'availability_visibility';

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'artist_availability';

select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'set_artist_availability_visibility';
```

The migration preserves the legacy month/day JSON availability. Artists must re-enter dates in the normalized calendar because legacy entries do not contain a trustworthy year, time range, or time zone. Test private, connections-only, and public visibility with an owner, an accepted connection, an unrelated authenticated user, and a signed-out visitor before treating the feature as production-ready.

## Artist direct messaging migration

Run `migrations/202610260003_artist_direct_messages.sql` after the availability migration. This adds participant-only `artist_conversations` and `artist_messages` tables plus the `send_artist_message` RPC. The frontend never uses a service-role key. Verify the migration before using Message in production:

```sql
select to_regclass('public.artist_conversations') as conversations_table,
       to_regclass('public.artist_messages') as messages_table;

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('artist_conversations', 'artist_messages');

select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'send_artist_message';
```

## Artist photo gallery migration

Run `migrations/202610270001_artist_photo_gallery.sql` after the Artist Network migration. This adds the public gallery photos used by the swipeable artist profile photo deck. GitHub Pages does not apply this migration automatically.

Verify the column after running it:

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'artist_directory'
  and column_name = 'gallery_photo_urls';
```

Only authenticated active artists can send messages to published artists. Conversation and message reads are limited by RLS to the two participants.
