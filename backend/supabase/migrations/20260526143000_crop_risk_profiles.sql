-- FarmAlert AI Agriculture Intelligence Engine risk profiles.

ALTER TABLE public.crop_weather_thresholds
  ADD COLUMN IF NOT EXISTS disease_humidity_threshold NUMERIC;

UPDATE public.crop_weather_thresholds
SET disease_humidity_threshold = COALESCE(disease_humidity_threshold, ideal_humidity);

CREATE TABLE IF NOT EXISTS public.crop_risk_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL UNIQUE,
  heat_risk TEXT,
  pest_risk TEXT,
  rainfall_risk TEXT,
  disease_risk TEXT,
  irrigation_stress TEXT,
  wind_damage_risk TEXT,
  crop_damage_probability NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crop_risk_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'crop_risk_profiles'
      AND policyname = 'Anyone can view crop risk profiles'
  ) THEN
    CREATE POLICY "Anyone can view crop risk profiles"
    ON public.crop_risk_profiles FOR SELECT
    USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS crop_risk_profiles_crop_name_idx
  ON public.crop_risk_profiles (lower(crop_name));

ALTER TABLE public.weather_alerts
  ADD COLUMN IF NOT EXISTS recommended_actions JSONB;
