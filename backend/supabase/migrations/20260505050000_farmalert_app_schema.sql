-- FarmAlert app schema
-- Safe to run after the original profiles migration.

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'daily',
  status TEXT NOT NULL DEFAULT 'active',
  amount_paise INTEGER NOT NULL DEFAULT 200,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_plan_check CHECK (plan IN ('daily', 'monthly')),
  CONSTRAINT subscriptions_status_check CHECK (status IN ('active', 'paused', 'cancelled', 'expired'))
);

CREATE TABLE IF NOT EXISTS public.weather_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'yellow',
  district TEXT,
  state TEXT NOT NULL DEFAULT 'Gujarat',
  temperature TEXT,
  humidity TEXT,
  wind_speed TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT weather_alerts_severity_check CHECK (severity IN ('green', 'yellow', 'orange', 'red'))
);

CREATE TABLE IF NOT EXISTS public.farming_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  crop_type TEXT,
  language TEXT NOT NULL DEFAULT 'gu',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT farming_tips_language_check CHECK (language IN ('gu', 'hi', 'en'))
);

CREATE TABLE IF NOT EXISTS public.agri_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  url TEXT,
  language TEXT NOT NULL DEFAULT 'gu',
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT agri_news_language_check CHECK (language IN ('gu', 'hi', 'en'))
);

CREATE TABLE IF NOT EXISTS public.user_alert_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  weather_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  farming_tips_enabled BOOLEAN NOT NULL DEFAULT true,
  news_enabled BOOLEAN NOT NULL DEFAULT true,
  preferred_language TEXT NOT NULL DEFAULT 'gu',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT user_alert_preferences_language_check CHECK (preferred_language IN ('gu', 'hi', 'en'))
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agri_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alert_preferences ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'Users can view own subscription'
  ) THEN
    CREATE POLICY "Users can view own subscription"
    ON public.subscriptions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'Users can upsert own subscription'
  ) THEN
    CREATE POLICY "Users can upsert own subscription"
    ON public.subscriptions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'Users can update own subscription'
  ) THEN
    CREATE POLICY "Users can update own subscription"
    ON public.subscriptions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'weather_alerts' AND policyname = 'Anyone can view active weather alerts'
  ) THEN
    CREATE POLICY "Anyone can view active weather alerts"
    ON public.weather_alerts FOR SELECT
    TO anon, authenticated
    USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'farming_tips' AND policyname = 'Anyone can view active farming tips'
  ) THEN
    CREATE POLICY "Anyone can view active farming tips"
    ON public.farming_tips FOR SELECT
    TO anon, authenticated
    USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'agri_news' AND policyname = 'Anyone can view active agri news'
  ) THEN
    CREATE POLICY "Anyone can view active agri news"
    ON public.agri_news FOR SELECT
    TO anon, authenticated
    USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_alert_preferences' AND policyname = 'Users can view own alert preferences'
  ) THEN
    CREATE POLICY "Users can view own alert preferences"
    ON public.user_alert_preferences FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_alert_preferences' AND policyname = 'Users can insert own alert preferences'
  ) THEN
    CREATE POLICY "Users can insert own alert preferences"
    ON public.user_alert_preferences FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_alert_preferences' AND policyname = 'Users can update own alert preferences'
  ) THEN
    CREATE POLICY "Users can update own alert preferences"
    ON public.user_alert_preferences FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE OR REPLACE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_weather_alerts_updated_at
BEFORE UPDATE ON public.weather_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_farming_tips_updated_at
BEFORE UPDATE ON public.farming_tips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_agri_news_updated_at
BEFORE UPDATE ON public.agri_news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_alert_preferences_updated_at
BEFORE UPDATE ON public.user_alert_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
