# QLCT Supabase setup

1. Create a Supabase project.
2. Open SQL Editor and run `schema.sql`.
3. Keep Email provider enabled in Authentication > Providers.
4. In the web app, open `Cai dat` > `Supabase Cloud Sync`.
5. Register or sign in with email and password.
6. Tap `Luu & sync`.

Use the same email/password on another device to pull the same data.

The secret sync code remains available as a fallback for old data or no-login sync.

Optional keep-alive:

Copy `keepalive.github-actions.yml.example` to `.github/workflows/supabase-keepalive.yml`, then add GitHub Actions secrets:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SYNC_ID`

The workflow calls `qlct_get_state` three times per week so the free project keeps receiving database activity.
