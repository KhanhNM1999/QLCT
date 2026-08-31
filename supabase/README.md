# QLCT Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor and run `schema.sql`.
3. Deploy the web app.
4. Open the app and register with username/password.

The app stores password hashes in `qlct_users`, browser sessions in `qlct_sessions`, and account state in `qlct_app_states`.

The app UI only exposes username login, username registration, logout, and account sync status.

Optional keep-alive:

Copy `keepalive.github-actions.yml.example` to `.github/workflows/supabase-keepalive.yml`, then add GitHub Actions secrets:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

The workflow calls a lightweight login attempt three times per week so the free project keeps receiving database activity.
