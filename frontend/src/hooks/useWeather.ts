import { useQuery } from "@tanstack/react-query";
import { WeatherLocationInput, WeatherService } from "@/services/weatherService";

const WEATHER_LOCATION_CACHE_VERSION = "google-weather-v1";

export const useWeather = (location: WeatherLocationInput | string | null | undefined) => {
  const resolvedLocation =
    typeof location === "string"
      ? { district: location?.trim() || "Ahmedabad", state: "Gujarat" }
      : {
          village: location?.village || null,
          taluka: location?.taluka || null,
          district: location?.district || "Ahmedabad",
          state: location?.state || "Gujarat",
          cropType: location?.cropType || null,
        };

  return useQuery({
    queryKey: ["weather", WEATHER_LOCATION_CACHE_VERSION, resolvedLocation],
    queryFn: () => WeatherService.getWeatherForLocation(resolvedLocation),
    enabled: Boolean(resolvedLocation.district || resolvedLocation.village),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
};
