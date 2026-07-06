-- FarmAlert Consolidated Production Database Schema Setup Script
-- Paste this script into your Supabase Dashboard > SQL Editor and run it.

-- 1. Profiles Table Extension
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS taluka TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'gu',
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS farming_type TEXT,
  ADD COLUMN IF NOT EXISTS crop_name TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

-- Create security definer function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql;

-- Configure RLS policies for admins on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- 2. User Subscriptions Table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('FREE', 'PREMIUM', 'PRO')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can upsert their own subscriptions" ON public.user_subscriptions
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
    FOR ALL USING (true);


-- 3. Plan Permissions Table
CREATE TABLE IF NOT EXISTS public.plan_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type TEXT NOT NULL CHECK (plan_type IN ('FREE', 'PREMIUM', 'PRO')),
    feature_name TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(plan_type, feature_name)
);

ALTER TABLE public.plan_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view plan_permissions" ON public.plan_permissions;
CREATE POLICY "Anyone can view plan_permissions" ON public.plan_permissions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage plan_permissions" ON public.plan_permissions;
CREATE POLICY "Admins can manage plan_permissions" ON public.plan_permissions
    FOR ALL USING (true);

-- Seed plan permissions
INSERT INTO public.plan_permissions (plan_type, feature_name, is_enabled) VALUES
('FREE', 'Weather', TRUE),
('FREE', 'News', TRUE),
('FREE', 'Tips', TRUE),
('PREMIUM', 'Weather', TRUE),
('PREMIUM', 'News', TRUE),
('PREMIUM', 'Tips', TRUE),
('PREMIUM', 'Advanced Alerts', TRUE),
('PREMIUM', 'WhatsApp Alerts', TRUE),
('PREMIUM', 'AI Recommendations', TRUE),
('PRO', 'Weather', TRUE),
('PRO', 'News', TRUE),
('PRO', 'Tips', TRUE),
('PRO', 'Advanced Alerts', TRUE),
('PRO', 'WhatsApp Alerts', TRUE),
('PRO', 'AI Recommendations', TRUE),
('PRO', 'Disease Scanner', TRUE),
('PRO', 'Voice Assistant', TRUE),
('PRO', 'SMS Alerts', TRUE)
ON CONFLICT (plan_type, feature_name) DO UPDATE SET is_enabled = EXCLUDED.is_enabled;


-- 4. Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    village TEXT NOT NULL,
    taluka TEXT NOT NULL,
    district TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Weather Issue', 'Translation Issue', 'Scanner Issue', 'News Issue', 'Profile Issue', 'Bug Report', 'Feature Request', 'Other')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    screenshot_url TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Review', 'Resolved', 'Rejected')),
    admin_reply TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create complaints" ON public.complaints;
CREATE POLICY "Users can create complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can select own complaints" ON public.complaints;
CREATE POLICY "Users can select own complaints" ON public.complaints
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage complaints" ON public.complaints;
CREATE POLICY "Admins can manage complaints" ON public.complaints
    FOR ALL USING (true);


-- 5. Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_message TEXT NOT NULL,
    language TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create feedback" ON public.feedback;
CREATE POLICY "Users can create feedback" ON public.feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view feedback" ON public.feedback;
CREATE POLICY "Anyone can view feedback" ON public.feedback
    FOR SELECT USING (true);


-- 6. Scan History Table
CREATE TABLE IF NOT EXISTS public.scan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    disease_name TEXT NOT NULL,
    confidence_score INTEGER NOT NULL,
    recommendation TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own scan_history" ON public.scan_history;
CREATE POLICY "Users can insert own scan_history" ON public.scan_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own scan_history" ON public.scan_history;
CREATE POLICY "Users can view own scan_history" ON public.scan_history
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all scan_history" ON public.scan_history;
CREATE POLICY "Admins can view all scan_history" ON public.scan_history
    FOR SELECT USING (true);


-- 7. Weather Alerts Table
CREATE TABLE IF NOT EXISTS public.weather_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'yellow' CHECK (severity IN ('green', 'yellow', 'orange', 'red')),
  district TEXT,
  state TEXT NOT NULL DEFAULT 'Gujarat',
  temperature TEXT,
  humidity TEXT,
  wind_speed TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active weather alerts" ON public.weather_alerts;
CREATE POLICY "Anyone can view active weather alerts" ON public.weather_alerts
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage weather alerts" ON public.weather_alerts;
CREATE POLICY "Admins can manage weather alerts" ON public.weather_alerts
    FOR ALL USING (true);


-- 8. Farms Table
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  area_acres NUMERIC,
  primary_crop TEXT,
  soil_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all farms" ON public.farms;
CREATE POLICY "Admins can manage all farms" ON public.farms
    FOR ALL TO authenticated USING (public.is_admin());


-- 9. Devices Table
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_uid TEXT UNIQUE NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  device_type TEXT CHECK (device_type IN ('soil_moisture', 'weather_station', 'irrigation_valve')),
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  last_communication TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all devices" ON public.devices;
CREATE POLICY "Admins can manage all devices" ON public.devices
    FOR ALL TO authenticated USING (public.is_admin());
