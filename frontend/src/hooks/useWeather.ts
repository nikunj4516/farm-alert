import { useQuery } from "@tanstack/react-query";
import { WeatherService } from "@/services/weatherService";

export const useWeather = (district: string | null | undefined) => {
  const resolvedDistrict = district?.trim() || "Ahmedabad";

  return useQuery({
    queryKey: ["weather", resolvedDistrict],
    queryFn: () => WeatherService.getWeatherForDistrict(resolvedDistrict),
    enabled: Boolean(resolvedDistrict),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
};
