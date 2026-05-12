import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/database.types";

type WeatherCache = Database["public"]["Tables"]["weather_cache"]["Row"];

export class WeatherService {
  private static CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

  static async getWeatherForDistrict(district: string): Promise<WeatherCache | null> {
    try {
      // 1. Check Cache
      const { data: cachedWeather, error: cacheError } = await supabase
        .from("weather_cache")
        .select("*")
        .eq("district", district)
        .single();

      if (!cacheError && cachedWeather) {
        const cacheAge = new Date().getTime() - new Date(cachedWeather.fetched_at).getTime();
        if (cacheAge < this.CACHE_DURATION_MS) {
          return cachedWeather;
        }
      }

      // 2. Fetch from External API (Mocking if no API Key provided)
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      
      let newWeather: Partial<WeatherCache> = {};

      if (apiKey) {
        // Example integration with WeatherAPI.com
        const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${district}&aqi=no`);
        if (res.ok) {
          const data = await res.json();
          newWeather = {
            district,
            temperature: data.current.temp_c,
            humidity: data.current.humidity,
            rainfall: data.current.precip_mm,
            wind_speed: data.current.wind_kph,
            weather_condition: data.current.condition.text,
            uv_index: data.current.uv,
          };
        }
      } else {
        // Fallback Mock Data for Development
        newWeather = {
          district,
          temperature: 30 + Math.floor(Math.random() * 5),
          humidity: 60 + Math.floor(Math.random() * 20),
          rainfall: Math.floor(Math.random() * 10),
          wind_speed: 10 + Math.floor(Math.random() * 15),
          weather_condition: "Partly cloudy",
          uv_index: 5 + Math.floor(Math.random() * 3),
        };
      }

      // 3. Upsert Cache
      if (newWeather.temperature !== undefined) {
        const { data: upsertedWeather, error: upsertError } = await supabase
          .from("weather_cache")
          .upsert({
            district: newWeather.district!,
            temperature: newWeather.temperature,
            humidity: newWeather.humidity,
            rainfall: newWeather.rainfall,
            wind_speed: newWeather.wind_speed,
            weather_condition: newWeather.weather_condition,
            uv_index: newWeather.uv_index,
            fetched_at: new Date().toISOString(),
          }, { onConflict: "district" })
          .select()
          .single();

        if (upsertError) throw upsertError;
        return upsertedWeather;
      }

      return cachedWeather; // Return stale cache if API failed
    } catch (error) {
      console.error("Error fetching weather:", error);
      return null;
    }
  }
}
