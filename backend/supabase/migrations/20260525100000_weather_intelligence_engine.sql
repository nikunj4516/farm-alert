-- FarmAlert Agriculture Weather Intelligence Engine

ALTER TABLE public.weather_cache
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS feels_like NUMERIC,
  ADD COLUMN IF NOT EXISTS precipitation_probability NUMERIC,
  ADD COLUMN IF NOT EXISTS cloud_coverage NUMERIC,
  ADD COLUMN IF NOT EXISTS visibility NUMERIC,
  ADD COLUMN IF NOT EXISTS forecast_json JSONB,
  ADD COLUMN IF NOT EXISTS hourly_json JSONB,
  ADD COLUMN IF NOT EXISTS alerts_json JSONB,
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS stale_after TIMESTAMP WITH TIME ZONE;

CREATE UNIQUE INDEX IF NOT EXISTS weather_cache_location_coordinates_idx
  ON public.weather_cache (location, latitude, longitude);

CREATE INDEX IF NOT EXISTS weather_cache_coordinates_idx
  ON public.weather_cache (latitude, longitude);

CREATE INDEX IF NOT EXISTS weather_cache_fetched_at_idx
  ON public.weather_cache (fetched_at DESC);

ALTER TABLE public.weather_alerts
  ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS crop_name TEXT,
  ADD COLUMN IF NOT EXISTS alert_type TEXT,
  ADD COLUMN IF NOT EXISTS alert_message TEXT,
  ADD COLUMN IF NOT EXISTS recommendation TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;

CREATE INDEX IF NOT EXISTS weather_alerts_farmer_created_idx
  ON public.weather_alerts (farmer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS weather_alerts_type_idx
  ON public.weather_alerts (alert_type);
