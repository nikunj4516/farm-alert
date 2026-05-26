import { useQuery } from "@tanstack/react-query";
import { ProfileService } from "@/services/profileService";
import { NewsService } from "@/services/newsService";
import { TipsService } from "@/services/tipsService";
import { AlertsService } from "@/services/alertsService";
import { useWeather } from "@/hooks/useWeather";

export const useDashboardData = (userId: string | undefined, selectedLanguage?: string) => {
  const newsLanguageFeedVersion = "language-first-v2";

  // 1. Fetch Profile
  const { 
    data: profile, 
    isLoading: isProfileLoading,
    error: profileError
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => ProfileService.getProfile(userId!),
    enabled: !!userId,
  });

  const district = profile?.district || "Ahmedabad";
  const language = selectedLanguage || profile?.preferred_language || "gu";
  const cropType = profile?.crop_type || undefined;

  // 2. Fetch Weather based on district
  const {
    data: weather,
    isLoading: isWeatherLoading,
    error: weatherError,
  } = useWeather({
    village: profile?.village,
    taluka: profile?.taluka,
    district,
    state: profile?.state || "Gujarat",
    cropType,
  });

  // 3. Fetch Personalized News
  const {
    data: news,
    isLoading: isNewsLoading,
  } = useQuery({
    queryKey: ["agriculture-news", newsLanguageFeedVersion, cropType, profile?.state, profile?.district, language],
    queryFn: () =>
      NewsService.getPersonalizedNews({
        cropType,
        state: profile?.state,
        district: profile?.district,
        language,
        limit: 5,
      }),
    enabled: Boolean(profile),
  });

  // 4. Fetch Personalized Tips
  const {
    data: tips,
    isLoading: isTipsLoading,
  } = useQuery({
    queryKey: ["tips", language, cropType],
    queryFn: () => TipsService.getTips({ language, cropType }),
    enabled: !!language,
  });

  // 5. Fetch Alerts
  const {
    data: alerts,
    isLoading: isAlertsLoading,
  } = useQuery({
    queryKey: ["alerts", userId],
    queryFn: () => AlertsService.getUnreadAlerts(userId!),
    enabled: !!userId,
  });

  return {
    profile,
    weather,
    news,
    tips,
    alerts,
    isLoading: isProfileLoading || isWeatherLoading || isNewsLoading || isTipsLoading || isAlertsLoading,
    isProfileLoading,
    isWeatherLoading,
    isNewsLoading,
    errors: { profileError, weatherError }
  };
};
