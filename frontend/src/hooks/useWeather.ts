import { useQuery } from "@tanstack/react-query";
import { WeatherLocationInput, WeatherService } from "@/services/weatherService";

const WEATHER_LOCATION_CACHE_VERSION = "gujarat-location-v2";

export const useWeather = (location: WeatherLocationInput | string | null | undefined) => {
  const resolvedLocation =
    typeof location === "string"
      ? { district: location?.trim() || null, state: "Gujarat" }
      : {
          village: location?.village || null,
          taluka: location?.taluka || null,
          district: location?.district || null,
          state: location?.state || "Gujarat",
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          cropType: location?.cropType || null,
        };

  return useQuery({
    queryKey: ["weather", WEATHER_LOCATION_CACHE_VERSION, resolvedLocation],
    queryFn: () => WeatherService.getWeatherForLocation(resolvedLocation),
    enabled: Boolean(resolvedLocation.latitude || resolvedLocation.district || resolvedLocation.taluka || resolvedLocation.village),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
};
