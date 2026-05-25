-- Profile display fields used by the FarmAlert web profile card.
-- The app can save with the older schema, but applying this migration enables
-- state, language, profile image, and richer farming details to persist too.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS taluka TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'gu',
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS farming_type TEXT,
  ADD COLUMN IF NOT EXISTS crop_name TEXT;

UPDATE public.profiles
SET preferred_language = 'gu'
WHERE preferred_language IS NULL;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'Profile',
  'Profile',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload own profile images'
  ) THEN
    CREATE POLICY "Users can upload own profile images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'Profile'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own profile images'
  ) THEN
    CREATE POLICY "Users can update own profile images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'Profile'
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'Profile'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own profile images'
  ) THEN
    CREATE POLICY "Users can delete own profile images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'Profile'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Anyone can view profile images'
  ) THEN
    CREATE POLICY "Anyone can view profile images"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'Profile');
  END IF;
END $$;
