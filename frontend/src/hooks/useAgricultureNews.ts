import { useQuery } from "@tanstack/react-query";
import { NewsQueryOptions, NewsService } from "@/services/newsService";

export const useAgricultureNews = (options: NewsQueryOptions = {}) =>
  useQuery({
    queryKey: ["agriculture-news-feed", options],
    queryFn: () => NewsService.getLatestNews(options),
    staleTime: 5 * 60 * 1000,
  });

export const usePersonalizedAgricultureNews = (options: NewsQueryOptions = {}) =>
  useQuery({
    queryKey: ["personalized-agriculture-news", options],
    queryFn: () => NewsService.getPersonalizedNews(options),
    staleTime: 5 * 60 * 1000,
  });
