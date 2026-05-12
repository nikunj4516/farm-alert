import { useQuery } from "@tanstack/react-query";
import { ProfileService } from "@/services/profileService";
import { WeatherService } from "@/services/weatherService";
import { NewsService } from "@/services/newsService";
import { TipsService } from "@/services/tipsService";
import { AlertsService } from "@/services/alertsService";

export const useDashboardData = (userId: string | undefined) => {
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
  const language = profile?.preferred_language || "gu";
  const cropType = profile?.crop_type || undefined;

  // 2. Fetch Weather based on district
  const {
    data: weather,
    isLoading: isWeatherLoading,
  } = useQuery({
    queryKey: ["weather", district],
    queryFn: () => WeatherService.getWeatherForDistrict(district),
    enabled: !!district,
  });

  // 3. Fetch Personalized News
  const {
    data: news,
    isLoading: isNewsLoading,
  } = useQuery({
    queryKey: ["news", language],
    queryFn: () => NewsService.getLatestNews(language, 5),
    enabled: !!language,
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
    errors: { profileError }
  };
};
