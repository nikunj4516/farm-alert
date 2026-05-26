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

## Weather Provider

FarmAlert prefers Google Maps Platform Weather API when a key is configured, then falls back to Open-Meteo.

Frontend local env:

```text
VITE_GOOGLE_WEATHER_API_KEY=your_google_weather_api_key
```

For production, prefer calling the backend weather route and keep the key server-side:

```text
GOOGLE_WEATHER_API_KEY=your_google_weather_api_key
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
