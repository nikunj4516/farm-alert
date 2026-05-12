-- Add DELETE policies to allow users to delete their own data
-- Prevents IDOR and ensures data ownership consistency

DO $$
BEGIN
  -- Profiles DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can delete own profile'
  ) THEN
    CREATE POLICY "Users can delete own profile"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  -- Subscriptions DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'Users can delete own subscription'
  ) THEN
    CREATE POLICY "Users can delete own subscription"
    ON public.subscriptions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  -- User Alert Preferences DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_alert_preferences' AND policyname = 'Users can delete own alert preferences'
  ) THEN
    CREATE POLICY "Users can delete own alert preferences"
    ON public.user_alert_preferences FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

END $$;
