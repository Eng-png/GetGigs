# GetGigs Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor**, paste `migrations/202610080001_getgigs_auth.sql`, and run it once.
3. Copy `.env.example` to `.env.local` and set the project URL and publishable key. Never use the `service_role` key in the browser app.
4. In **Authentication → URL Configuration**, set the Site URL and add the local/production reset-password redirect URLs.
5. Create the first account normally, then promote it in the SQL Editor:

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
