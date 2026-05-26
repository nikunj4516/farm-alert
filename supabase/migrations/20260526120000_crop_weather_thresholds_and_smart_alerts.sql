-- FarmAlert crop-aware weather intelligence schema.
-- Stores crop weather tolerance thresholds and richer alert fields for future
-- push notifications, WhatsApp alerts, voice alerts, and AI risk scoring.

CREATE TABLE IF NOT EXISTS public.crop_weather_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL UNIQUE,
  min_temperature NUMERIC,
  max_temperature NUMERIC,
  ideal_humidity NUMERIC,
  rainfall_tolerance NUMERIC,
  wind_tolerance NUMERIC,
  heatwave_risk_level TEXT,
  frost_risk_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crop_weather_thresholds ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'crop_weather_thresholds'
      AND policyname = 'Anyone can view crop weather thresholds'
  ) THEN
    CREATE POLICY "Anyone can view crop weather thresholds"
    ON public.crop_weather_thresholds FOR SELECT
    USING (true);
  END IF;
END $$;

INSERT INTO public.crop_weather_thresholds (
  crop_name,
  min_temperature,
  max_temperature,
  ideal_humidity,
  rainfall_tolerance,
  wind_tolerance,
  heatwave_risk_level,
  frost_risk_level
) VALUES
  ('Wheat', 7, 35, 70, 25, 36, 'HIGH', 'CRITICAL'),
  ('Rice', 18, 38, 85, 70, 42, 'MEDIUM', 'HIGH'),
  ('Cotton', 16, 40, 75, 35, 38, 'HIGH', 'HIGH'),
  ('Groundnut', 15, 38, 70, 45, 36, 'HIGH', 'MEDIUM'),
  ('Sugarcane', 16, 40, 80, 65, 34, 'MEDIUM', 'HIGH'),
  ('Vegetables', 12, 34, 72, 25, 28, 'CRITICAL', 'HIGH')
ON CONFLICT (crop_name) DO UPDATE SET
  min_temperature = EXCLUDED.min_temperature,
  max_temperature = EXCLUDED.max_temperature,
  ideal_humidity = EXCLUDED.ideal_humidity,
  rainfall_tolerance = EXCLUDED.rainfall_tolerance,
  wind_tolerance = EXCLUDED.wind_tolerance,
  heatwave_risk_level = EXCLUDED.heatwave_risk_level,
  frost_risk_level = EXCLUDED.frost_risk_level;

ALTER TABLE public.weather_alerts
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS alert_title TEXT,
  ADD COLUMN IF NOT EXISTS weather_condition TEXT,
  ADD COLUMN IF NOT EXISTS metric_label TEXT,
  ADD COLUMN IF NOT EXISTS metric_value TEXT,
  ADD COLUMN IF NOT EXISTS priority INTEGER,
  ADD COLUMN IF NOT EXISTS action_status TEXT NOT NULL DEFAULT 'new';

ALTER TABLE public.weather_alerts
  DROP CONSTRAINT IF EXISTS weather_alerts_severity_check;

ALTER TABLE public.weather_alerts
  ADD CONSTRAINT weather_alerts_severity_check
  CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'green', 'yellow', 'orange', 'red'));

CREATE INDEX IF NOT EXISTS crop_weather_thresholds_crop_name_idx
  ON public.crop_weather_thresholds (lower(crop_name));

CREATE INDEX IF NOT EXISTS weather_alerts_severity_created_idx
  ON public.weather_alerts (severity, created_at DESC);
