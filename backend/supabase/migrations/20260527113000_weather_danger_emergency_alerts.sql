-- FarmAlert weather danger and emergency alert readiness.

CREATE TABLE IF NOT EXISTS public.crop_weather_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL UNIQUE,
  max_temperature NUMERIC,
  humidity_threshold NUMERIC,
  rainfall_threshold NUMERIC,
  wind_threshold NUMERIC,
  disease_risk_conditions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crop_weather_rules ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'crop_weather_rules'
      AND policyname = 'Anyone can view crop weather rules'
  ) THEN
    CREATE POLICY "Anyone can view crop weather rules"
    ON public.crop_weather_rules FOR SELECT
    USING (true);
  END IF;
END $$;

INSERT INTO public.crop_weather_rules (
  crop_name,
  max_temperature,
  humidity_threshold,
  rainfall_threshold,
  wind_threshold,
  disease_risk_conditions
) VALUES
  ('Cotton', 40, 75, 35, 38, '{"risks":["whitefly","fungal_disease"],"avoid":["pesticide_spraying_before_rain"]}'::jsonb),
  ('Rice', 38, 85, 70, 42, '{"risks":["waterlogging","root_disease"],"actions":["drainage_monitoring"]}'::jsonb),
  ('Wheat', 35, 70, 25, 36, '{"risks":["heat_stress","rust"],"actions":["field_scouting"]}'::jsonb),
  ('Groundnut', 38, 70, 45, 36, '{"risks":["moisture_stress","fungal_disease"],"actions":["soil_moisture_check"]}'::jsonb),
  ('Sugarcane', 40, 80, 65, 34, '{"risks":["lodging","wind_damage"],"actions":["support_mature_crop"]}'::jsonb),
  ('Vegetables', 34, 72, 25, 28, '{"risks":["leaf_burn","moisture_stress"],"actions":["shade","evening_irrigation"]}'::jsonb)
ON CONFLICT (crop_name) DO UPDATE SET
  max_temperature = EXCLUDED.max_temperature,
  humidity_threshold = EXCLUDED.humidity_threshold,
  rainfall_threshold = EXCLUDED.rainfall_threshold,
  wind_threshold = EXCLUDED.wind_threshold,
  disease_risk_conditions = EXCLUDED.disease_risk_conditions;

ALTER TABLE public.weather_alerts
  ADD COLUMN IF NOT EXISTS village TEXT,
  ADD COLUMN IF NOT EXISTS alert_level TEXT,
  ADD COLUMN IF NOT EXISTS danger_score NUMERIC,
  ADD COLUMN IF NOT EXISTS notification_channels TEXT[],
  ADD COLUMN IF NOT EXISTS whatsapp_message TEXT,
  ADD COLUMN IF NOT EXISTS sms_message TEXT,
  ADD COLUMN IF NOT EXISTS emergency_pinned BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS weather_alerts_danger_score_idx
  ON public.weather_alerts (danger_score DESC, created_at DESC);
