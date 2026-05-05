# FarmAlert

FarmAlert is organized for a stable production branch and a working development branch.

## Branches

- `main` - stable branch
- `dev` - working branch

## Folder Structure

```text
farmalert/
  frontend/
  backend/
```

## Run Frontend

```powershell
cd frontend
npm install
npm run dev
```

## Supabase Database

The Supabase schema lives in:

```text
backend/supabase/migrations/
```

Current tables:

- `profiles`
- `subscriptions`
- `weather_alerts`
- `farming_tips`
- `agri_news`
- `user_alert_preferences`

If the Supabase CLI is installed and authenticated, apply migrations with:

```powershell
supabase link --project-ref qikxllxqtpsprlzddyyu
supabase db push
```

Without the CLI, open Supabase Dashboard > SQL Editor and run the migration SQL files in order.
