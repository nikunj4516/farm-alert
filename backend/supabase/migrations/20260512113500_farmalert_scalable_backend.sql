-- FarmAlert Scalable Backend Update

-- 1. Modify PROFILES
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Gujarat',
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'gu';

-- 2. Create FARMS
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_size NUMERIC,
  soil_type TEXT,
  irrigation_type TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own farms" ON public.farms FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own farms" ON public.farms FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own farms" ON public.farms FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own farms" ON public.farms FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON public.farms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Create CROPS
CREATE TABLE IF NOT EXISTS public.crops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  season TEXT,
  sowing_date DATE,
  expected_harvest_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crops" ON public.crops FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own crops" ON public.crops FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own crops" ON public.crops FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own crops" ON public.crops FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON public.crops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Create WEATHER CACHE
CREATE TABLE IF NOT EXISTS public.weather_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district TEXT NOT NULL UNIQUE,
  temperature NUMERIC,
  humidity NUMERIC,
  rainfall NUMERIC,
  wind_speed NUMERIC,
  weather_condition TEXT,
  uv_index NUMERIC,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view weather cache" ON public.weather_cache FOR SELECT TO authenticated USING (true);
-- Application server updates cache via service role, or we can allow authenticated users to upsert
CREATE POLICY "Authenticated users can upsert weather" ON public.weather_cache FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update weather" ON public.weather_cache FOR UPDATE TO authenticated USING (true);

-- 5. Modify AGRI NEWS to match requirements
ALTER TABLE public.agri_news 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT;

-- 6. Modify FARMING TIPS
ALTER TABLE public.farming_tips
  ADD COLUMN IF NOT EXISTS season TEXT,
  ADD COLUMN IF NOT EXISTS content TEXT;

-- 7. Create FARMER ALERTS
CREATE TABLE IF NOT EXISTS public.farmer_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.farmer_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON public.farmer_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.farmer_alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts" ON public.farmer_alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);
-- Alerts usually inserted by backend functions/triggers, but can be inserted by authenticated (e.g. system generated on client)
CREATE POLICY "Users can insert own alerts" ON public.farmer_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

