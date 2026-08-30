# QLCT Supabase setup

1. Create a Supabase project.
2. Open SQL Editor and run `schema.sql`.
3. In the web app, open `Cai dat` > `Supabase Cloud Sync`.
4. Paste Project URL and anon public key from Supabase Project Settings > API.
5. Generate a secret sync code, then tap `Luu & sync`.

Use the same Project URL, anon key, and secret sync code on another device to pull the same data.

Optional keep-alive:

Copy `keepalive.github-actions.yml.example` to `.github/workflows/supabase-keepalive.yml`, then add GitHub Actions secrets:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SYNC_ID`

The workflow calls `qlct_get_state` three times per week so the free project keeps receiving database activity.
