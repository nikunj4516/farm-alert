-- Migration: Create user_subscriptions, plan_permissions, scan_history and alter/re-create complaints/feedback tables.
-- Description: Implement full production-grade database schema for FarmAlert subscription simulation, feature access control, complaint center, feedback and scanner history.

-- 1. Create user_subscriptions Table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('FREE', 'PREMIUM', 'PRO')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own subscriptions" ON public.user_subscriptions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
    FOR ALL USING (true);


-- 2. Create plan_permissions Table
CREATE TABLE IF NOT EXISTS public.plan_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type TEXT NOT NULL CHECK (plan_type IN ('FREE', 'PREMIUM', 'PRO')),
    feature_name TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(plan_type, feature_name)
);

-- Enable RLS for plan_permissions
ALTER TABLE public.plan_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plan_permissions" ON public.plan_permissions
    FOR SELECT USING (true);

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


-- 3. Re-create complaints Table with correct fields
DROP TABLE IF EXISTS public.complaints CASCADE;

CREATE TABLE public.complaints (
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

-- Enable RLS for complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own complaints" ON public.complaints
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage complaints" ON public.complaints
    FOR ALL USING (true);


-- 4. Create feedback Table (singular, as requested)
DROP TABLE IF EXISTS public.feedback CASCADE;

CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_message TEXT NOT NULL,
    language TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create feedback" ON public.feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view feedback" ON public.feedback
    FOR SELECT USING (true);


-- 5. Create scan_history Table
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

-- Enable RLS for scan_history
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own scan_history" ON public.scan_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own scan_history" ON public.scan_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scan_history" ON public.scan_history
    FOR SELECT USING (true);
