-- Phase 2 weather backend cache for FarmAlert.
-- Stores current weather plus normalized 7-day forecast data by district.

CREATE TABLE IF NOT EXISTS public.weather_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district TEXT NOT NULL UNIQUE,
  temperature NUMERIC,
  humidity NUMERIC,
  rainfall NUMERIC,
  wind_speed NUMERIC,
  weather_condition TEXT,
  uv_index NUMERIC,
  forecast JSONB NOT NULL DEFAULT '[]'::jsonb,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.weather_cache
  ADD COLUMN IF NOT EXISTS uv_index NUMERIC,
  ADD COLUMN IF NOT EXISTS forecast JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS weather_cache_district_idx
  ON public.weather_cache (lower(district));

CREATE INDEX IF NOT EXISTS weather_cache_fetched_at_idx
  ON public.weather_cache (fetched_at DESC);

ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'weather_cache'
      AND policyname = 'Anyone can view weather cache'
  ) THEN
    CREATE POLICY "Anyone can view weather cache"
    ON public.weather_cache FOR SELECT
    TO anon, authenticated
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'weather_cache'
      AND policyname = 'Authenticated users can insert weather cache'
  ) THEN
    CREATE POLICY "Authenticated users can insert weather cache"
    ON public.weather_cache FOR INSERT
    TO authenticated
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'weather_cache'
      AND policyname = 'Authenticated users can update weather cache'
  ) THEN
    CREATE POLICY "Authenticated users can update weather cache"
    ON public.weather_cache FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;
