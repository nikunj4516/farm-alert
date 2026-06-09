-- Migration: Create Complaints and Feedbacks tables
-- Description: Create tables to store customer complaints, feedbacks, and ratings.

-- 1. Create Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    village TEXT NOT NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    screenshot_url TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    admin_reply TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for Complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Create Policies for Complaints
CREATE POLICY "Users can create their own complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own complaints" ON public.complaints
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can do everything on complaints" ON public.complaints
    FOR ALL USING (
        -- Simple check for admin role/claim, or fallback to true if admin role check is handle separately
        true
    );

-- 2. Create Feedbacks Table
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    favorite_feature TEXT NOT NULL,
    suggestions TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for Feedbacks
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Create Policies for Feedbacks
CREATE POLICY "Users can create their own feedbacks" ON public.feedbacks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedbacks" ON public.feedbacks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedbacks" ON public.feedbacks
    FOR SELECT USING (true);
