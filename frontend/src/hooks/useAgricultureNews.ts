import { useQuery } from "@tanstack/react-query";
import { NewsQueryOptions, NewsService } from "@/services/newsService";

const NEWS_LANGUAGE_FEED_VERSION = "language-first-v3";

export const useAgricultureNews = (options: NewsQueryOptions = {}) =>
  useQuery({
    queryKey: ["agriculture-news-feed", NEWS_LANGUAGE_FEED_VERSION, options],
    queryFn: () => NewsService.getLatestNews(options),
    staleTime: 5 * 60 * 1000,
  });

export const usePersonalizedAgricultureNews = (options: NewsQueryOptions = {}) =>
  useQuery({
    queryKey: ["personalized-agriculture-news", NEWS_LANGUAGE_FEED_VERSION, options],
    queryFn: () => NewsService.getPersonalizedNews(options),
    staleTime: 5 * 60 * 1000,
  });
