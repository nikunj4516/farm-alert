-- Agriculture News Pipeline
-- Stores only fetched/verified external agriculture news. No seed/fake news is inserted.

CREATE TABLE IF NOT EXISTS public.agriculture_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  crop_related TEXT[] NOT NULL DEFAULT '{}',
  state_related TEXT[] NOT NULL DEFAULT '{}',
  title_hash TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS agriculture_news_source_url_idx
  ON public.agriculture_news (source_url);

CREATE UNIQUE INDEX IF NOT EXISTS agriculture_news_title_hash_idx
  ON public.agriculture_news (title_hash)
  WHERE title_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS agriculture_news_published_at_idx
  ON public.agriculture_news (published_at DESC);

CREATE INDEX IF NOT EXISTS agriculture_news_category_idx
  ON public.agriculture_news (category);

CREATE INDEX IF NOT EXISTS agriculture_news_crop_related_idx
  ON public.agriculture_news USING GIN (crop_related);

CREATE INDEX IF NOT EXISTS agriculture_news_state_related_idx
  ON public.agriculture_news USING GIN (state_related);

CREATE TABLE IF NOT EXISTS public.news_fetch_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  fetched_count INTEGER NOT NULL DEFAULT 0,
  saved_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT news_fetch_logs_status_check CHECK (status IN ('started', 'success', 'partial', 'failed'))
);

ALTER TABLE public.agriculture_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_fetch_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'agriculture_news' AND policyname = 'Anyone can view agriculture news'
  ) THEN
    CREATE POLICY "Anyone can view agriculture news"
    ON public.agriculture_news FOR SELECT
    TO anon, authenticated
    USING (true);
  END IF;
END $$;

CREATE OR REPLACE TRIGGER update_agriculture_news_updated_at
BEFORE UPDATE ON public.agriculture_news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
