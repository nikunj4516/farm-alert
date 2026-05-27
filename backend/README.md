# FarmAlert Backend

Backend and database-related files live here.

## Supabase

Supabase configuration and migrations are in `backend/supabase/`.

## Weather

The backend weather service uses Google Maps Platform Weather API first when configured:

```text
GOOGLE_WEATHER_API_KEY=your_google_weather_api_key
```

If the key is missing or Google Weather returns an error, the service falls back to Open-Meteo.

The backend weather intelligence flow is:

```text
GET /api/weather/intelligence
  -> resolve farmer location
  -> fetch/cache weather
  -> run cropWeatherRulesEngine.js
  -> generate smart crop alerts
  -> calculate crop risk profile
  -> classify GREEN/YELLOW/RED weather danger
  -> generate recommended actions
  -> prepare WhatsApp/SMS emergency payloads for RED alerts
  -> persist non-safe alerts + crop risk profiles + danger score
  -> return weather + agricultureAlerts + cropRiskProfile + recommendations + dangerAssessment
```
