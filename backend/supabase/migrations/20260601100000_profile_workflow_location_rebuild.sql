-- FarmAlert production onboarding and stable location workflow.
-- Gujarat is fixed by product scope and is intentionally not duplicated per profile.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'gu';

UPDATE public.profiles
SET
  profile_completed = (
    COALESCE(name, '') <> ''
    AND COALESCE(district, '') <> ''
    AND COALESCE(taluka, '') <> ''
    AND COALESCE(village, '') <> ''
    AND COALESCE(crop_type, '') <> ''
  ),
  onboarding_completed = (
    COALESCE(name, '') <> ''
    AND COALESCE(district, '') <> ''
    AND COALESCE(taluka, '') <> ''
    AND COALESCE(village, '') <> ''
    AND COALESCE(crop_type, '') <> ''
  )
WHERE profile_completed = false OR onboarding_completed = false;

CREATE INDEX IF NOT EXISTS profiles_location_lookup_idx
  ON public.profiles (district, taluka, village);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'Profile',
  'Profile',
  true,
  8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
