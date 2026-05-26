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

## Agriculture Weather Intelligence

The weather tab is built as a crop-risk advisor:

```text
Farmer location
  -> weather provider + cache
  -> crop weather thresholds
  -> agriculture rule engine
  -> smart alerts + recommendations
  -> dashboard cards + Supabase alert storage
```

Core modules:

- `frontend/src/services/agricultureWeatherRules.ts` - crop thresholds and client-side smart alert generation.
- `backend/services/agricultureWeatherRules.js` - server-side rule engine used for persisted alerts.
- `frontend/src/components/weather/SmartWeatherAlerts.tsx` - primary actionable alert feed.
- `supabase/migrations/20260526120000_crop_weather_thresholds_and_smart_alerts.sql` - crop threshold table and richer alert fields.

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
