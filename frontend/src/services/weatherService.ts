import { supabase } from "@/integrations/supabase/client";
import { Database, Json } from "@/types/database.types";

type WeatherCacheRow = Database["public"]["Tables"]["weather_cache"]["Row"];
type WeatherCacheInsert = Database["public"]["Tables"]["weather_cache"]["Insert"];

export type WeatherProvider = "weatherapi" | "openweather" | "openmeteo";

export interface WeatherForecastDay {
  date: string;
  temperature: number | null;
  minTemperature: number | null;
  maxTemperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  windSpeed: number | null;
  uvIndex: number | null;
  weatherCondition: string | null;
  icon: string;
}

export interface WeatherReport extends Omit<WeatherCacheRow, "forecast"> {
  forecast: WeatherForecastDay[];
  isCached: boolean;
  isStale: boolean;
}

type WeatherCacheRecord = WeatherCacheRow & {
  forecast?: Json | null;
};

interface WeatherApiForecastDay {
  date?: string;
  day?: {
    avgtemp_c?: unknown;
    mintemp_c?: unknown;
    maxtemp_c?: unknown;
    avghumidity?: unknown;
    totalprecip_mm?: unknown;
    maxwind_kph?: unknown;
    uv?: unknown;
    condition?: {
      text?: string;
    };
  };
}

interface OpenWeatherDailyForecast {
  dt?: number;
  temp?: {
    day?: unknown;
    min?: unknown;
    max?: unknown;
  };
  humidity?: unknown;
  rain?: unknown;
  wind_speed?: unknown;
  uvi?: unknown;
  weather?: Array<{
    description?: string;
  }>;
}

interface OpenMeteoLocation {
  name?: string;
  admin2?: string;
  country?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
}

const DEFAULT_DISTRICT = "Ahmedabad";
const CACHE_DURATION_MS = 60 * 60 * 1000;

const conditionToIcon = (condition?: string | null) => {
  const normalized = condition?.toLowerCase() ?? "";

  if (normalized.includes("thunder") || normalized.includes("storm")) return "⛈️";
  if (normalized.includes("rain") || normalized.includes("drizzle")) return "🌧️";
  if (normalized.includes("cloud") || normalized.includes("overcast")) return "☁️";
  if (normalized.includes("mist") || normalized.includes("fog") || normalized.includes("haze")) return "🌫️";
  if (normalized.includes("sun") || normalized.includes("clear")) return "☀️";

  return "🌦️";
};

const openMeteoWeatherCode = (code: unknown): string | null => {
  const numeric = toNumber(code);
  if (numeric === null) return null;

  if (numeric === 0) return "Clear sky";
  if ([1, 2].includes(numeric)) return "Partly cloudy";
  if (numeric === 3) return "Overcast";
  if ([45, 48].includes(numeric)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(numeric)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(numeric)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(numeric)) return "Snow";
  if ([95, 96, 99].includes(numeric)) return "Thunderstorm";

  return "Cloudy";
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const round = (value: unknown) => {
  const numeric = toNumber(value);
  return numeric === null ? null : Math.round(numeric * 10) / 10;
};

const normalizeDistrict = (district?: string | null) =>
  (district?.trim() || DEFAULT_DISTRICT).replace(/\s+/g, " ");

const cacheAge = (fetchedAt: string) =>
  Date.now() - new Date(fetchedAt).getTime();

const parseForecast = (forecast: Json | null | undefined): WeatherForecastDay[] => {
  if (!Array.isArray(forecast)) return [];

  return forecast
    .map((day) => {
      if (!day || typeof day !== "object" || Array.isArray(day)) return null;
      const record = day as Record<string, Json | undefined>;
      const weatherCondition = typeof record.weatherCondition === "string" ? record.weatherCondition : null;

      return {
        date: typeof record.date === "string" ? record.date : "",
        temperature: round(record.temperature),
        minTemperature: round(record.minTemperature),
        maxTemperature: round(record.maxTemperature),
        humidity: round(record.humidity),
        rainfall: round(record.rainfall),
        windSpeed: round(record.windSpeed),
        uvIndex: round(record.uvIndex),
        weatherCondition,
        icon: typeof record.icon === "string" ? record.icon : conditionToIcon(weatherCondition),
      };
    })
    .filter((day): day is WeatherForecastDay => Boolean(day?.date))
    .slice(0, 7);
};

const toReport = (
  row: WeatherCacheRecord,
  flags: Pick<WeatherReport, "isCached" | "isStale">
): WeatherReport => ({
  id: row.id,
  district: row.district,
  temperature: row.temperature,
  humidity: row.humidity,
  rainfall: row.rainfall,
  wind_speed: row.wind_speed,
  weather_condition: row.weather_condition,
  uv_index: row.uv_index,
  fetched_at: row.fetched_at,
  forecast: parseForecast(row.forecast),
  ...flags,
});

const fallbackForecast = (): WeatherForecastDay[] => {
  const samples = [
    { temperature: 34, minTemperature: 27, maxTemperature: 35, humidity: 82, rainfall: 4, windSpeed: 25, uvIndex: 7, weatherCondition: "Light rain" },
    { temperature: 31, minTemperature: 26, maxTemperature: 33, humidity: 78, rainfall: 8, windSpeed: 22, uvIndex: 6, weatherCondition: "Thunderstorm" },
    { temperature: 29, minTemperature: 25, maxTemperature: 31, humidity: 84, rainfall: 5, windSpeed: 18, uvIndex: 5, weatherCondition: "Patchy rain" },
    { temperature: 32, minTemperature: 26, maxTemperature: 34, humidity: 71, rainfall: 1, windSpeed: 16, uvIndex: 8, weatherCondition: "Partly cloudy" },
    { temperature: 35, minTemperature: 28, maxTemperature: 36, humidity: 65, rainfall: 0, windSpeed: 14, uvIndex: 9, weatherCondition: "Sunny" },
    { temperature: 33, minTemperature: 27, maxTemperature: 34, humidity: 73, rainfall: 2, windSpeed: 17, uvIndex: 7, weatherCondition: "Cloudy" },
    { temperature: 30, minTemperature: 25, maxTemperature: 32, humidity: 80, rainfall: 6, windSpeed: 20, uvIndex: 5, weatherCondition: "Rain" },
  ];

  return samples.map((sample, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      date: date.toISOString().slice(0, 10),
      ...sample,
      icon: conditionToIcon(sample.weatherCondition),
    };
  });
};

const fallbackReport = (district: string): WeatherReport => {
  const forecast = fallbackForecast();
  const current = forecast[0];

  return {
    id: "fallback",
    district,
    temperature: current.temperature,
    humidity: current.humidity,
    rainfall: current.rainfall,
    wind_speed: current.windSpeed,
    weather_condition: current.weatherCondition,
    uv_index: current.uvIndex,
    forecast,
    fetched_at: new Date().toISOString(),
    isCached: false,
    isStale: true,
  };
};

const getProvider = (): WeatherProvider => {
  const configured = String(import.meta.env.VITE_WEATHER_PROVIDER || "weatherapi").toLowerCase();
  if (configured === "openmeteo") return "openmeteo";
  return configured === "openweather" ? "openweather" : "weatherapi";
};

const getWeatherApiKey = () =>
  String(import.meta.env.VITE_WEATHER_API_KEY || import.meta.env.VITE_WEATHERAPI_KEY || "");

const getOpenWeatherKey = () =>
  String(import.meta.env.VITE_OPENWEATHER_API_KEY || import.meta.env.VITE_WEATHER_API_KEY || "");

const fetchWeatherApiForecast = async (district: string): Promise<WeatherCacheInsert> => {
  const apiKey = getWeatherApiKey();
  if (!apiKey) throw new Error("Missing VITE_WEATHER_API_KEY for WeatherAPI integration.");

  const params = new URLSearchParams({
    key: apiKey,
    q: `${district}, India`,
    days: "7",
    aqi: "no",
    alerts: "no",
  });
  const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`WeatherAPI request failed with ${response.status}.`);
  }

  const data = await response.json();
  const current = data.current ?? {};
  const forecastDays: WeatherApiForecastDay[] = Array.isArray(data.forecast?.forecastday)
    ? data.forecast.forecastday
    : [];
  const forecast: WeatherForecastDay[] = forecastDays.slice(0, 7).map((day) => ({
    date: day.date,
    temperature: round(day.day?.avgtemp_c),
    minTemperature: round(day.day?.mintemp_c),
    maxTemperature: round(day.day?.maxtemp_c),
    humidity: round(day.day?.avghumidity),
    rainfall: round(day.day?.totalprecip_mm),
    windSpeed: round(day.day?.maxwind_kph),
    uvIndex: round(day.day?.uv),
    weatherCondition: day.day?.condition?.text ?? null,
    icon: conditionToIcon(day.day?.condition?.text),
  }));

  return {
    district,
    temperature: round(current.temp_c),
    humidity: round(current.humidity),
    rainfall: round(current.precip_mm),
    wind_speed: round(current.wind_kph),
    weather_condition: current.condition?.text ?? null,
    uv_index: round(current.uv),
    forecast: forecast as unknown as Json,
    fetched_at: new Date().toISOString(),
  };
};

const fetchOpenWeatherForecast = async (district: string): Promise<WeatherCacheInsert> => {
  const apiKey = getOpenWeatherKey();
  if (!apiKey) throw new Error("Missing VITE_OPENWEATHER_API_KEY for OpenWeather integration.");

  const geoParams = new URLSearchParams({
    q: `${district},IN`,
    limit: "1",
    appid: apiKey,
  });
  const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?${geoParams.toString()}`);

  if (!geoResponse.ok) {
    throw new Error(`OpenWeather geocoding request failed with ${geoResponse.status}.`);
  }

  const [location] = await geoResponse.json();
  if (!location) throw new Error(`OpenWeather could not resolve district "${district}".`);

  const weatherParams = new URLSearchParams({
    lat: String(location.lat),
    lon: String(location.lon),
    appid: apiKey,
    units: "metric",
    exclude: "minutely,hourly,alerts",
  });
  const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?${weatherParams.toString()}`);

  if (!response.ok) {
    throw new Error(`OpenWeather request failed with ${response.status}.`);
  }

  const data = await response.json();
  const current = data.current ?? {};
  const currentRainfall = current.rain?.["1h"] ?? current.rain?.["3h"] ?? 0;
  const dailyForecast: OpenWeatherDailyForecast[] = Array.isArray(data.daily) ? data.daily : [];
  const forecast: WeatherForecastDay[] = dailyForecast.slice(0, 7).map((day) => {
    const weatherCondition = day.weather?.[0]?.description ?? null;
    return {
      date: new Date(day.dt * 1000).toISOString().slice(0, 10),
      temperature: round(day.temp?.day),
      minTemperature: round(day.temp?.min),
      maxTemperature: round(day.temp?.max),
      humidity: round(day.humidity),
      rainfall: round(day.rain ?? 0),
      windSpeed: round(day.wind_speed ? day.wind_speed * 3.6 : null),
      uvIndex: round(day.uvi),
      weatherCondition,
      icon: conditionToIcon(weatherCondition),
    };
  });

  const weatherCondition = current.weather?.[0]?.description ?? null;

  return {
    district,
    temperature: round(current.temp),
    humidity: round(current.humidity),
    rainfall: round(currentRainfall),
    wind_speed: round(current.wind_speed ? current.wind_speed * 3.6 : null),
    weather_condition: weatherCondition,
    uv_index: round(current.uvi),
    forecast: forecast as unknown as Json,
    fetched_at: new Date().toISOString(),
  };
};

const fetchOpenMeteoForecast = async (district: string): Promise<WeatherCacheInsert> => {
  const geoParams = new URLSearchParams({
    name: district,
    count: "10",
    language: "en",
    format: "json",
  });
  const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${geoParams.toString()}`);

  if (!geoResponse.ok) {
    throw new Error(`Open-Meteo geocoding request failed with ${geoResponse.status}.`);
  }

  const geoData = await geoResponse.json();
  const locations: OpenMeteoLocation[] = Array.isArray(geoData.results) ? geoData.results : [];
  const location =
    locations.find((item) => item.country_code === "IN") ||
    locations.find((item) => item.country?.toLowerCase() === "india") ||
    locations[0];

  if (!location) throw new Error(`Open-Meteo could not resolve district "${district}".`);

  const weatherParams = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "wind_speed_10m_max",
      "uv_index_max",
    ].join(","),
    timezone: "auto",
    forecast_days: "7",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${weatherParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Open-Meteo forecast request failed with ${response.status}.`);
  }

  const data = await response.json();
  const current = data.current ?? {};
  const daily = data.daily ?? {};
  const dates = Array.isArray(daily.time) ? daily.time : [];
  const currentCondition = openMeteoWeatherCode(current.weather_code);

  const forecast: WeatherForecastDay[] = dates.slice(0, 7).map((date: string, index: number) => {
    const weatherCondition = openMeteoWeatherCode(daily.weather_code?.[index]);
    const minTemperature = round(daily.temperature_2m_min?.[index]);
    const maxTemperature = round(daily.temperature_2m_max?.[index]);

    return {
      date,
      temperature:
        minTemperature !== null && maxTemperature !== null
          ? round((minTemperature + maxTemperature) / 2)
          : maxTemperature,
      minTemperature,
      maxTemperature,
      humidity: index === 0 ? round(current.relative_humidity_2m) : null,
      rainfall: round(daily.precipitation_sum?.[index]),
      windSpeed: round(daily.wind_speed_10m_max?.[index]),
      uvIndex: round(daily.uv_index_max?.[index]),
      weatherCondition,
      icon: conditionToIcon(weatherCondition),
    };
  });

  return {
    district: location.admin2 || location.name || district,
    temperature: round(current.temperature_2m),
    humidity: round(current.relative_humidity_2m),
    rainfall: round(current.precipitation),
    wind_speed: round(current.wind_speed_10m),
    weather_condition: currentCondition,
    uv_index: round(daily.uv_index_max?.[0]),
    forecast: forecast as unknown as Json,
    fetched_at: new Date().toISOString(),
  };
};

export class WeatherService {
  static async getWeatherForDistrict(districtInput?: string | null): Promise<WeatherReport> {
    const district = normalizeDistrict(districtInput);
    let cachedWeather: WeatherCacheRecord | null = null;

    const { data, error: cacheError } = await supabase
      .from("weather_cache")
      .select("*")
      .ilike("district", district)
      .maybeSingle();

    if (!cacheError && data) {
      cachedWeather = data as WeatherCacheRecord;
      if (cacheAge(cachedWeather.fetched_at) < CACHE_DURATION_MS) {
        return toReport(cachedWeather, { isCached: true, isStale: false });
      }
    }

    try {
      const provider = getProvider();
      const freshWeather =
        provider === "openmeteo"
          ? await fetchOpenMeteoForecast(district)
          : provider === "openweather"
            ? await fetchOpenWeatherForecast(district)
            : await fetchWeatherApiForecast(district);

      const { data: upsertedWeather, error: upsertError } = await supabase
        .from("weather_cache")
        .upsert(freshWeather, { onConflict: "district" })
        .select("*")
        .single();

      if (upsertError) throw upsertError;

      return toReport(upsertedWeather as WeatherCacheRecord, { isCached: false, isStale: false });
    } catch (error) {
      console.warn("Configured weather integration failed; trying Open-Meteo fallback.", error);

      try {
        const freshWeather = await fetchOpenMeteoForecast(district);
        const { data: upsertedWeather, error: upsertError } = await supabase
          .from("weather_cache")
          .upsert(freshWeather, { onConflict: "district" })
          .select("*")
          .single();

        if (upsertError) throw upsertError;

        return toReport(upsertedWeather as WeatherCacheRecord, { isCached: false, isStale: false });
      } catch (fallbackError) {
        console.error("Open-Meteo weather fallback failed:", fallbackError);
      }

      if (cachedWeather) {
        return toReport(cachedWeather, { isCached: true, isStale: true });
      }

      return fallbackReport(district);
    }
  }
}
