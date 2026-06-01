import { supabase } from "@/integrations/supabase/client";
import { Database, Json } from "@/types/database.types";
import { SmartAgricultureAlert } from "@/services/agricultureWeatherRules";
import { CropRiskEngine, type CropRiskProfile } from "@/services/cropRiskEngine";
import { EmergencyAlertEngine, type EmergencyAlertPayload } from "@/services/emergencyAlertEngine";
import { RecommendationEngine, type FarmingRecommendation } from "@/services/recommendationEngine";
import { SmartCropAlertService } from "@/services/smartCropAlertService";
import { WeatherDangerEngine, type WeatherDangerAssessment } from "@/services/weatherDangerEngine";
import { buildLocationDisplay, validateGujaratLocation } from "@/services/gujaratLocationService";

type WeatherCacheRow = Database["public"]["Tables"]["weather_cache"]["Row"];
type WeatherCacheInsert = Database["public"]["Tables"]["weather_cache"]["Insert"];

export type WeatherProvider = "google_weather" | "weatherapi" | "openweather" | "openmeteo";
export type AlertLevel = "green" | "yellow" | "orange" | "red";

export interface WeatherLocationInput {
  village?: string | null;
  taluka?: string | null;
  district?: string | null;
  state?: string | null;
  cropType?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface WeatherForecastDay {
  date: string;
  temperature: number | null;
  minTemperature: number | null;
  maxTemperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  precipitationProbability: number | null;
  windSpeed: number | null;
  uvIndex: number | null;
  sunrise?: string | null;
  sunset?: string | null;
  weatherCondition: string | null;
  icon: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  precipitationProbability: number | null;
  windSpeed: number | null;
  cloudCoverage: number | null;
  visibility: number | null;
  pressure: number | null;
  dewPoint: number | null;
  windDirection: number | null;
  weatherCondition: string | null;
  icon: string;
}

export interface AgricultureWeatherAlert {
  type: string;
  severity: AlertLevel;
  title?: string;
  message: string;
  recommendation: string;
  metricLabel?: string;
  metricValue?: string;
  color?: string;
  priority?: number;
}

export interface WeatherReport extends Omit<WeatherCacheRow, "forecast" | "forecast_json" | "hourly_json" | "alerts_json"> {
  location: string | null;
  feels_like: number | null;
  precipitation_probability: number | null;
  cloud_coverage: number | null;
  visibility: number | null;
  provider: string | null;
  forecast: WeatherForecastDay[];
  hourlyForecast: HourlyForecast[];
  agricultureAlerts: SmartAgricultureAlert[];
  cropRiskProfile: CropRiskProfile;
  recommendations: FarmingRecommendation[];
  dangerAssessment: WeatherDangerAssessment;
  emergencyAlert: EmergencyAlertPayload;
  pressure: number | null;
  dew_point: number | null;
  wind_direction: number | null;
  sunrise: string | null;
  sunset: string | null;
  air_quality_index: number | null;
  isCached: boolean;
  isStale: boolean;
}

type WeatherCacheRecord = WeatherCacheRow & {
  forecast?: Json | null;
  forecast_json?: Json | null;
  hourly_json?: Json | null;
  alerts_json?: Json | null;
};

interface ResolvedLocation {
  location: string;
  latitude: number;
  longitude: number;
  district: string;
  taluka: string | null;
}

interface OpenMeteoLocation {
  name?: string;
  latitude?: number;
  longitude?: number;
  country_code?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
}

const GUJARAT_LOCATION_COORDINATES: Record<string, { name: string; district: string; latitude: number; longitude: number }> = {
  jambughoda: { name: "Jambughoda", district: "Panchmahal", latitude: 22.3667, longitude: 73.7333 },
  "jambughoda taluka": { name: "Jambughoda", district: "Panchmahal", latitude: 22.3667, longitude: 73.7333 },
  panchmahal: { name: "Godhra", district: "Panchmahal", latitude: 22.7755, longitude: 73.6149 },
  godhra: { name: "Godhra", district: "Panchmahal", latitude: 22.7755, longitude: 73.6149 },
  vasad: { name: "Vasad", district: "Anand", latitude: 22.4538, longitude: 73.0665 },
  borsad: { name: "Borsad", district: "Anand", latitude: 22.4079, longitude: 72.8982 },
  anand: { name: "Anand", district: "Anand", latitude: 22.5645, longitude: 72.9289 },
};

const GUJARAT_VILLAGE_TALUKA_HINTS: Record<string, string> = {
  "rampura|panchmahal": "jambughoda",
};

const GUJARAT_TALUKA_COORDINATES: Record<string, { name: string; district: string; latitude: number; longitude: number }> = {
  jambughoda: { name: "Jambughoda", district: "Panchmahal", latitude: 22.3667, longitude: 73.7333 },
  godhra: { name: "Godhra", district: "Panchmahal", latitude: 22.7755, longitude: 73.6149 },
  halol: { name: "Halol", district: "Panchmahal", latitude: 22.5036, longitude: 73.4728 },
  kalol: { name: "Kalol", district: "Panchmahal", latitude: 22.6077, longitude: 73.4633 },
  balasinor: { name: "Balasinor", district: "Mahisagar", latitude: 22.9559, longitude: 73.3365 },
  kadana: { name: "Kadana", district: "Mahisagar", latitude: 23.2824, longitude: 73.8442 },
  khanpur: { name: "Khanpur", district: "Mahisagar", latitude: 23.2924, longitude: 73.6156 },
  lunawada: { name: "Lunawada", district: "Mahisagar", latitude: 23.1284, longitude: 73.6105 },
  santrampur: { name: "Santrampur", district: "Mahisagar", latitude: 23.1892, longitude: 73.8960 },
  virpur: { name: "Virpur", district: "Mahisagar", latitude: 23.1862, longitude: 73.4798 },
  anand: { name: "Anand", district: "Anand", latitude: 22.5645, longitude: 72.9289 },
  borsad: { name: "Borsad", district: "Anand", latitude: 22.4079, longitude: 72.8982 },
  petlad: { name: "Petlad", district: "Anand", latitude: 22.4768, longitude: 72.8006 },
  umreth: { name: "Umreth", district: "Anand", latitude: 22.6988, longitude: 73.1156 },
  vadodara: { name: "Vadodara", district: "Vadodara", latitude: 22.3072, longitude: 73.1812 },
  dabhoi: { name: "Dabhoi", district: "Vadodara", latitude: 22.1836, longitude: 73.4336 },
  desar: { name: "Desar", district: "Vadodara", latitude: 22.6814, longitude: 73.2477 },
  karjan: { name: "Karjan", district: "Vadodara", latitude: 22.0536, longitude: 73.1230 },
  padra: { name: "Padra", district: "Vadodara", latitude: 22.2380, longitude: 73.0840 },
  savli: { name: "Savli", district: "Vadodara", latitude: 22.5608, longitude: 73.2214 },
  vaghodia: { name: "Vaghodia", district: "Vadodara", latitude: 22.3055, longitude: 73.3977 },
  ahmedabad: { name: "Ahmedabad", district: "Ahmedabad", latitude: 23.0225, longitude: 72.5714 },
  sanand: { name: "Sanand", district: "Ahmedabad", latitude: 22.9920, longitude: 72.3810 },
  dholka: { name: "Dholka", district: "Ahmedabad", latitude: 22.7273, longitude: 72.4413 },
  surat: { name: "Surat", district: "Surat", latitude: 21.1702, longitude: 72.8311 },
  bardoli: { name: "Bardoli", district: "Surat", latitude: 21.1220, longitude: 73.1115 },
  rajkot: { name: "Rajkot", district: "Rajkot", latitude: 22.3039, longitude: 70.8022 },
  gondal: { name: "Gondal", district: "Rajkot", latitude: 21.9619, longitude: 70.7927 },
};

const DEFAULT_LOCATION: WeatherLocationInput = { state: "Gujarat" };
const CACHE_DURATION_MS = 10 * 60 * 1000;
const OFFLINE_CACHE_KEY_PREFIX = "farmalert_weather_offline_v3:";
const MAX_TEMPERATURE_DELTA = 8;
const GOOGLE_WEATHER_BASE_URL = "https://weather.googleapis.com/v1";

const getGoogleWeatherApiKey = () =>
  import.meta.env.VITE_GOOGLE_WEATHER_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const round = (value: unknown) => {
  const numeric = toNumber(value);
  return numeric === null ? null : Math.round(numeric * 10) / 10;
};

const weatherCodeToCondition = (code: unknown): string | null => {
  const numeric = toNumber(code);
  if (numeric === null) return null;
  if (numeric === 0) return "Clear sky";
  if ([1, 2].includes(numeric)) return "Partly cloudy";
  if (numeric === 3) return "Overcast";
  if ([45, 48].includes(numeric)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(numeric)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(numeric)) return "Rain";
  if ([95, 96, 99].includes(numeric)) return "Thunderstorm";
  return "Cloudy";
};

const conditionToIcon = (condition?: string | null) => {
  const normalized = condition?.toLowerCase() ?? "";
  if (normalized.includes("thunder") || normalized.includes("storm")) return "⛈️";
  if (normalized.includes("rain") || normalized.includes("drizzle")) return "🌧️";
  if (normalized.includes("cloud") || normalized.includes("overcast")) return "☁️";
  if (normalized.includes("mist") || normalized.includes("fog") || normalized.includes("haze")) return "🌫️";
  if (normalized.includes("sun") || normalized.includes("clear")) return "☀️";
  return "🌦️";
};

const googleConditionText = (condition: Record<string, unknown> | null | undefined): string | null => {
  const description = condition?.description;
  if (description && typeof description === "object" && !Array.isArray(description)) {
    const text = (description as Record<string, unknown>).text;
    if (typeof text === "string" && text.trim()) return text;
  }

  const type = typeof condition?.type === "string" ? condition.type : "";
  return type
    ? type
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : null;
};

const googleTemperature = (value: Record<string, unknown> | null | undefined) => round(value?.degrees);
const googleSpeed = (wind: Record<string, unknown> | null | undefined) => {
  const speed = wind?.speed;
  return speed && typeof speed === "object" && !Array.isArray(speed) ? round((speed as Record<string, unknown>).value) : null;
};
const googleVisibility = (visibility: Record<string, unknown> | null | undefined) => round(visibility?.distance);
const googleRainfall = (precipitation: Record<string, unknown> | null | undefined) => {
  const qpf = precipitation?.qpf;
  return qpf && typeof qpf === "object" && !Array.isArray(qpf) ? round((qpf as Record<string, unknown>).quantity) : null;
};
const googlePrecipitationProbability = (precipitation: Record<string, unknown> | null | undefined) => {
  const probability = precipitation?.probability;
  return probability && typeof probability === "object" && !Array.isArray(probability)
    ? round((probability as Record<string, unknown>).percent)
    : null;
};

const googleWeatherParams = (location: ResolvedLocation, apiKey: string, extra: Record<string, string>) =>
  new URLSearchParams({
    key: apiKey,
    "location.latitude": String(location.latitude),
    "location.longitude": String(location.longitude),
    unitsSystem: "METRIC",
    languageCode: "en",
    ...extra,
  });

const normalizeLocationInput = (input?: WeatherLocationInput | string | null): WeatherLocationInput => {
  if (typeof input === "string") return { district: input, state: "Gujarat" };
  return {
    village: input?.village?.trim() || null,
    taluka: input?.taluka?.trim() || null,
    district: input?.district?.trim() || null,
    state: input?.state?.trim() || DEFAULT_LOCATION.state,
    cropType: input?.cropType?.trim() || null,
    latitude: input?.latitude || null,
    longitude: input?.longitude || null,
  };
};

const locationQuery = (input: WeatherLocationInput) =>
  [input.village, input.taluka, input.district, input.state, "India"].filter(Boolean).join(", ");

const normalizePlace = (value?: string | null) =>
  value
    ?.toLowerCase()
    .replace(/\s+/g, " ")
    .trim() || "";

const includesPlace = (value?: string | null, expected?: string | null) => {
  const normalizedValue = normalizePlace(value);
  const normalizedExpected = normalizePlace(expected);
  return Boolean(normalizedValue && normalizedExpected && normalizedValue.includes(normalizedExpected));
};

const uniqueCandidates = (input: WeatherLocationInput) => {
  const candidates = [
    [input.village, input.taluka, input.district, input.state].filter(Boolean).join(" "),
    [input.village, input.taluka, input.state].filter(Boolean).join(" "),
    [input.taluka, input.district, input.state].filter(Boolean).join(" "),
    [input.taluka, input.state].filter(Boolean).join(" "),
    [input.district, input.state].filter(Boolean).join(" "),
    input.taluka,
    input.district,
    input.state,
  ];

  return Array.from(new Set(candidates.filter(Boolean) as string[]));
};

const resolveKnownGujaratLocation = (input: WeatherLocationInput): ResolvedLocation | null => {
  if (normalizePlace(input.state) !== "gujarat") return null;

  if (input.latitude && input.longitude) {
    const validated = validateGujaratLocation(input);
    return {
      location: buildLocationDisplay(validated),
      latitude: input.latitude,
      longitude: input.longitude,
      district: validated.district || input.district || "Gujarat",
      taluka: validated.taluka || input.taluka || null,
    };
  }

  const validated = validateGujaratLocation(input);
  const talukaCoordinates = GUJARAT_TALUKA_COORDINATES[normalizePlace(validated.taluka || input.taluka)];
  if (talukaCoordinates) {
    return {
      location: buildLocationDisplay({
        village: input.village || null,
        taluka: talukaCoordinates.name,
        district: validated.district || talukaCoordinates.district,
        state: "Gujarat",
      }),
      latitude: talukaCoordinates.latitude,
      longitude: talukaCoordinates.longitude,
      district: validated.district || talukaCoordinates.district,
      taluka: talukaCoordinates.name,
    };
  }

  if (validated.latitude && validated.longitude && (validated.taluka || validated.district)) {
    return {
      location: buildLocationDisplay(validated),
      latitude: validated.latitude,
      longitude: validated.longitude,
      district: validated.district || "Gujarat",
      taluka: validated.taluka,
    };
  }

  const villageDistrictKey = `${normalizePlace(input.village)}|${normalizePlace(input.district)}`;
  const inferredTaluka = GUJARAT_VILLAGE_TALUKA_HINTS[villageDistrictKey];
  const key = normalizePlace(input.taluka) || inferredTaluka || normalizePlace(input.district);
  const known = GUJARAT_LOCATION_COORDINATES[key];
  if (!known) return null;

  return {
    location: Array.from(new Set([input.village, known.name, known.district, "Gujarat"].filter(Boolean))).join(", "),
    latitude: known.latitude,
    longitude: known.longitude,
    district: input.district || known.district,
    taluka: input.taluka || inferredTaluka || known.name,
  };
};

const cacheAge = (fetchedAt: string) => Date.now() - new Date(fetchedAt).getTime();

const parseForecast = (forecast: Json | null | undefined): WeatherForecastDay[] => {
  if (!Array.isArray(forecast)) return [];
  return forecast
    .map((day) => {
      if (!day || typeof day !== "object" || Array.isArray(day)) return null;
      const record = day as Record<string, Json | undefined>;
      const condition = typeof record.weatherCondition === "string" ? record.weatherCondition : null;
      return {
        date: typeof record.date === "string" ? record.date : "",
        temperature: round(record.temperature),
        minTemperature: round(record.minTemperature),
        maxTemperature: round(record.maxTemperature),
        humidity: round(record.humidity),
        rainfall: round(record.rainfall),
        precipitationProbability: round(record.precipitationProbability),
        windSpeed: round(record.windSpeed),
        uvIndex: round(record.uvIndex),
        sunrise: typeof record.sunrise === "string" ? record.sunrise : null,
        sunset: typeof record.sunset === "string" ? record.sunset : null,
        weatherCondition: condition,
        icon: typeof record.icon === "string" ? record.icon : conditionToIcon(condition),
      };
    })
    .filter((day): day is WeatherForecastDay => Boolean(day?.date))
    .slice(0, 7);
};

const parseHourly = (hourly: Json | null | undefined): HourlyForecast[] => {
  if (!Array.isArray(hourly)) return [];
  return hourly
    .map((hour) => {
      if (!hour || typeof hour !== "object" || Array.isArray(hour)) return null;
      const record = hour as Record<string, Json | undefined>;
      const condition = typeof record.weatherCondition === "string" ? record.weatherCondition : null;
      return {
        time: typeof record.time === "string" ? record.time : "",
        temperature: round(record.temperature),
        humidity: round(record.humidity),
        rainfall: round(record.rainfall),
        precipitationProbability: round(record.precipitationProbability),
        windSpeed: round(record.windSpeed),
        cloudCoverage: round(record.cloudCoverage),
        visibility: round(record.visibility),
        pressure: round(record.pressure),
        dewPoint: round(record.dewPoint),
        windDirection: round(record.windDirection),
        weatherCondition: condition,
        icon: typeof record.icon === "string" ? record.icon : conditionToIcon(condition),
      };
    })
    .filter((hour): hour is HourlyForecast => Boolean(hour?.time))
    .slice(0, 48);
};

const hasUsableForecast = (row: WeatherCacheRecord | null) =>
  parseForecast(row?.forecast_json || row?.forecast).length > 0 || parseHourly(row?.hourly_json).length > 0;

const cacheMatchesInput = (row: WeatherCacheRecord | null, input: WeatherLocationInput) => {
  if (!row) return false;
  const rowLocation = `${row.location || ""} ${row.district || ""}`;
  const stateMatches = !input.state || includesPlace(rowLocation, input.state);
  const talukaMatches = !input.taluka || includesPlace(rowLocation, input.taluka);
  const districtMatches = !input.district || includesPlace(row.location, input.district);

  return stateMatches && (input.taluka ? talukaMatches : districtMatches);
};

const offlineCacheKey = (input: WeatherLocationInput) =>
  `${OFFLINE_CACHE_KEY_PREFIX}${normalizePlace(input.taluka) || "district"}:${normalizePlace(input.district) || "gujarat"}`;

const readOfflineWeather = (input: WeatherLocationInput): WeatherCacheRecord | null => {
  try {
    const raw = localStorage.getItem(offlineCacheKey(input));
    return raw ? (JSON.parse(raw) as WeatherCacheRecord) : null;
  } catch {
    return null;
  }
};

const writeOfflineWeather = (input: WeatherLocationInput, weather: WeatherCacheInsert) => {
  try {
    localStorage.setItem(offlineCacheKey(input), JSON.stringify({ id: "offline", ...weather }));
  } catch {
    // Local cache is a best-effort safety net.
  }
};

const smoothFreshWeather = (fresh: WeatherCacheInsert, cached: WeatherCacheRecord | null): WeatherCacheInsert => {
  const freshTemp = toNumber(fresh.temperature);
  const cachedTemp = toNumber(cached?.temperature);
  if (freshTemp === null || cachedTemp === null) return fresh;
  if (Math.abs(freshTemp - cachedTemp) <= MAX_TEMPERATURE_DELTA) return fresh;

  return {
    ...fresh,
    temperature: round((freshTemp + cachedTemp) / 2),
    feels_like:
      toNumber(fresh.feels_like) !== null && toNumber(cached?.feels_like) !== null
        ? round((Number(fresh.feels_like) + Number(cached?.feels_like)) / 2)
        : fresh.feels_like,
  };
};

const resolveLocation = async (input: WeatherLocationInput): Promise<ResolvedLocation> => {
  const knownLocation = resolveKnownGujaratLocation(input);
  if (knownLocation) return knownLocation;

  const candidates = uniqueCandidates(input);
  const expectedState = normalizePlace(input.state);
  const expectedDistrict = normalizePlace(input.district);
  const expectedTaluka = normalizePlace(input.taluka);

  for (const candidate of candidates) {
    const params = new URLSearchParams({
      name: candidate,
      count: "100",
      language: "en",
      format: "json",
    });
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
    if (!response.ok) continue;

    const data = await response.json();
    const locations: OpenMeteoLocation[] = Array.isArray(data.results) ? data.results : [];
    const indiaLocations = locations.filter((item) => item.country_code === "IN");
    const scored = indiaLocations
      .map((item) => {
        const stateMatches = expectedState ? normalizePlace(item.admin1) === expectedState : true;
        const districtMatches = expectedDistrict
          ? [item.admin2, item.admin3, item.name].some((value) => includesPlace(value, expectedDistrict))
          : true;
        const talukaMatches = expectedTaluka
          ? [item.admin2, item.admin3, item.name].some((value) => includesPlace(value, expectedTaluka))
          : true;

        if (expectedState && !stateMatches) return null;
        if (expectedTaluka && !talukaMatches && normalizePlace(candidate).includes(expectedTaluka)) return null;
        if (!expectedTaluka && expectedDistrict && !districtMatches && normalizePlace(candidate).includes(expectedDistrict)) return null;

        let score = 0;
        if (stateMatches) score += 20;
        if (districtMatches) score += 12;
        if (talukaMatches) score += 24;
        if (normalizePlace(item.name) === expectedTaluka) score += 10;

        return { item, score };
      })
      .filter((value): value is { item: OpenMeteoLocation; score: number } => Boolean(value))
      .sort((a, b) => b.score - a.score);

    const match = scored[0]?.item || (!expectedState && indiaLocations[0]) || null;

    if (match?.latitude && match?.longitude) {
      const parts = [input.village, match.name, match.admin3, match.admin2, match.admin1].filter(Boolean);
      return {
        location: Array.from(new Set(parts)).join(", "),
        latitude: Number(match.latitude),
        longitude: Number(match.longitude),
        district: input.district || match.admin2 || match.name || "Gujarat",
        taluka: input.taluka || match.name || null,
      };
    }
  }

  throw new Error(`Could not resolve ${locationQuery(input)}.`);
};

const fetchOpenMeteoForecast = async (input: WeatherLocationInput): Promise<WeatherCacheInsert> => {
  const location = await resolveLocation(input);
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "rain",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
      "pressure_msl",
      "surface_pressure",
      "visibility",
    ].join(","),
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "dew_point_2m",
      "precipitation_probability",
      "precipitation",
      "rain",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
      "pressure_msl",
      "visibility",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "uv_index_max",
      "sunrise",
      "sunset",
    ].join(","),
    forecast_days: "7",
    timezone: "auto",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error(`Open-Meteo forecast failed with ${response.status}.`);
  const data = await response.json();
  const current = data.current ?? {};
  const daily = data.daily ?? {};
  const hourly = data.hourly ?? {};

  const forecast: WeatherForecastDay[] = (daily.time || []).slice(0, 7).map((date: string, index: number) => {
    const condition = weatherCodeToCondition(daily.weather_code?.[index]);
    const minTemperature = round(daily.temperature_2m_min?.[index]);
    const maxTemperature = round(daily.temperature_2m_max?.[index]);
    return {
      date,
      temperature: minTemperature !== null && maxTemperature !== null ? round((minTemperature + maxTemperature) / 2) : maxTemperature,
      minTemperature,
      maxTemperature,
      humidity: index === 0 ? round(current.relative_humidity_2m) : null,
      rainfall: round(daily.precipitation_sum?.[index]),
      precipitationProbability: round(daily.precipitation_probability_max?.[index]),
      windSpeed: round(daily.wind_speed_10m_max?.[index]),
      uvIndex: round(daily.uv_index_max?.[index]),
      sunrise: typeof daily.sunrise?.[index] === "string" ? daily.sunrise[index] : null,
      sunset: typeof daily.sunset?.[index] === "string" ? daily.sunset[index] : null,
      weatherCondition: condition,
      icon: conditionToIcon(condition),
    };
  });

  const hourlyForecast: HourlyForecast[] = (hourly.time || []).slice(0, 48).map((time: string, index: number) => {
    const condition = weatherCodeToCondition(hourly.weather_code?.[index]);
    return {
      time,
      temperature: round(hourly.temperature_2m?.[index]),
      humidity: round(hourly.relative_humidity_2m?.[index]),
      rainfall: round(hourly.rain?.[index] ?? hourly.precipitation?.[index]),
      precipitationProbability: round(hourly.precipitation_probability?.[index]),
      windSpeed: round(hourly.wind_speed_10m?.[index]),
      cloudCoverage: round(hourly.cloud_cover?.[index]),
      visibility: round(hourly.visibility?.[index]),
      pressure: round(hourly.pressure_msl?.[index]),
      dewPoint: round(hourly.dew_point_2m?.[index]),
      windDirection: round(hourly.wind_direction_10m?.[index]),
      weatherCondition: condition,
      icon: conditionToIcon(condition),
    };
  });
  const currentCondition = weatherCodeToCondition(current.weather_code);

  return {
    district: location.district,
    location: location.location,
    latitude: location.latitude,
    longitude: location.longitude,
    temperature: round(current.temperature_2m),
    feels_like: round(current.apparent_temperature),
    humidity: round(current.relative_humidity_2m),
    rainfall: round(current.rain ?? current.precipitation),
    wind_speed: round(current.wind_speed_10m),
    weather_condition: currentCondition,
    uv_index: forecast[0]?.uvIndex ?? null,
    precipitation_probability: hourlyForecast[0]?.precipitationProbability ?? null,
    cloud_coverage: round(current.cloud_cover),
    visibility: round(current.visibility),
    forecast: forecast as unknown as Json,
    forecast_json: forecast as unknown as Json,
    hourly_json: hourlyForecast as unknown as Json,
    alerts_json: [] as unknown as Json,
    provider: "openmeteo",
    stale_after: new Date(Date.now() + CACHE_DURATION_MS).toISOString(),
    fetched_at: new Date().toISOString(),
  };
};

const fetchGoogleWeatherForecast = async (input: WeatherLocationInput): Promise<WeatherCacheInsert> => {
  const apiKey = getGoogleWeatherApiKey();
  if (!apiKey) throw new Error("Missing VITE_GOOGLE_WEATHER_API_KEY.");

  const location = await resolveLocation(input);
  const [currentResponse, dailyResponse, hourlyResponse] = await Promise.all([
    fetch(`${GOOGLE_WEATHER_BASE_URL}/currentConditions:lookup?${googleWeatherParams(location, apiKey, {})}`),
    fetch(`${GOOGLE_WEATHER_BASE_URL}/forecast/days:lookup?${googleWeatherParams(location, apiKey, { days: "7", pageSize: "7" })}`),
    fetch(`${GOOGLE_WEATHER_BASE_URL}/forecast/hours:lookup?${googleWeatherParams(location, apiKey, { hours: "48", pageSize: "48" })}`),
  ]);

  if (!currentResponse.ok) throw new Error(`Google current weather failed with ${currentResponse.status}.`);
  if (!dailyResponse.ok) throw new Error(`Google daily forecast failed with ${dailyResponse.status}.`);
  if (!hourlyResponse.ok) throw new Error(`Google hourly forecast failed with ${hourlyResponse.status}.`);

  const current = await currentResponse.json();
  const daily = await dailyResponse.json();
  const hourly = await hourlyResponse.json();

  const forecast: WeatherForecastDay[] = (daily.forecastDays || []).slice(0, 7).map((day: Record<string, unknown>) => {
    const daytime = (day.daytimeForecast || {}) as Record<string, unknown>;
    const nighttime = (day.nighttimeForecast || {}) as Record<string, unknown>;
    const displayDate = (day.displayDate || {}) as Record<string, unknown>;
    const condition = googleConditionText(daytime.weatherCondition as Record<string, unknown>);
    const minTemperature = googleTemperature(day.minTemperature as Record<string, unknown>);
    const maxTemperature = googleTemperature(day.maxTemperature as Record<string, unknown>);
    const date =
      displayDate.year && displayDate.month && displayDate.day
        ? `${displayDate.year}-${String(displayDate.month).padStart(2, "0")}-${String(displayDate.day).padStart(2, "0")}`
        : ((day.interval as Record<string, unknown> | undefined)?.startTime as string) || "";

    return {
      date,
      temperature: minTemperature !== null && maxTemperature !== null ? round((minTemperature + maxTemperature) / 2) : maxTemperature,
      minTemperature,
      maxTemperature,
      humidity: round(daytime.relativeHumidity ?? nighttime.relativeHumidity),
      rainfall: googleRainfall(daytime.precipitation as Record<string, unknown>),
      precipitationProbability: googlePrecipitationProbability(daytime.precipitation as Record<string, unknown>),
      windSpeed: googleSpeed(daytime.wind as Record<string, unknown>),
      uvIndex: round(daytime.uvIndex),
      weatherCondition: condition,
      icon: conditionToIcon(condition),
    };
  });

  const hourlyForecast: HourlyForecast[] = (hourly.forecastHours || []).slice(0, 48).map((hour: Record<string, unknown>) => {
    const condition = googleConditionText(hour.weatherCondition as Record<string, unknown>);
    return {
      time: ((hour.interval as Record<string, unknown> | undefined)?.startTime as string) || "",
      temperature: googleTemperature(hour.temperature as Record<string, unknown>),
      humidity: round(hour.relativeHumidity),
      rainfall: googleRainfall(hour.precipitation as Record<string, unknown>),
      precipitationProbability: googlePrecipitationProbability(hour.precipitation as Record<string, unknown>),
      windSpeed: googleSpeed(hour.wind as Record<string, unknown>),
      cloudCoverage: round(hour.cloudCover),
      visibility: googleVisibility(hour.visibility as Record<string, unknown>),
      weatherCondition: condition,
      icon: conditionToIcon(condition),
    };
  });

  const currentCondition = googleConditionText(current.weatherCondition);

  return {
    district: location.district,
    location: location.location,
    latitude: location.latitude,
    longitude: location.longitude,
    temperature: googleTemperature(current.temperature),
    feels_like: googleTemperature(current.feelsLikeTemperature),
    humidity: round(current.relativeHumidity),
    rainfall: googleRainfall(current.precipitation),
    wind_speed: googleSpeed(current.wind),
    weather_condition: currentCondition,
    uv_index: round(current.uvIndex),
    precipitation_probability: googlePrecipitationProbability(current.precipitation),
    cloud_coverage: round(current.cloudCover),
    visibility: googleVisibility(current.visibility),
    forecast: forecast as unknown as Json,
    forecast_json: forecast as unknown as Json,
    hourly_json: hourlyForecast as unknown as Json,
    alerts_json: [] as unknown as Json,
    provider: "google_weather",
    stale_after: new Date(Date.now() + CACHE_DURATION_MS).toISOString(),
    fetched_at: new Date().toISOString(),
  };
};

const toReport = (row: WeatherCacheRecord, input: WeatherLocationInput, flags: Pick<WeatherReport, "isCached" | "isStale">): WeatherReport => {
  const forecast = parseForecast(row.forecast_json || row.forecast);
  const hourlyForecast = parseHourly(row.hourly_json);
  const currentHour = hourlyForecast[0];
  const base = {
    id: row.id,
    district: row.district,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    temperature: row.temperature,
    feels_like: row.feels_like,
    humidity: row.humidity,
    rainfall: row.rainfall,
    wind_speed: row.wind_speed,
    weather_condition: row.weather_condition,
    uv_index: row.uv_index,
    precipitation_probability: row.precipitation_probability,
    cloud_coverage: row.cloud_coverage,
    visibility: row.visibility,
    pressure: currentHour?.pressure ?? null,
    dew_point: currentHour?.dewPoint ?? null,
    wind_direction: currentHour?.windDirection ?? null,
    sunrise: forecast[0]?.sunrise ?? null,
    sunset: forecast[0]?.sunset ?? null,
    air_quality_index: null,
    provider: row.provider,
    stale_after: row.stale_after,
    fetched_at: row.fetched_at,
    forecast,
    hourlyForecast,
    ...flags,
  };
  const agricultureAlerts = SmartCropAlertService.generate(base, input.cropType);
  const recommendations = RecommendationEngine.generate(base, input.cropType, agricultureAlerts);
  const dangerAssessment = WeatherDangerEngine.assess(base, input.cropType);
  return {
    ...base,
    agricultureAlerts,
    cropRiskProfile: CropRiskEngine.calculate(base, input.cropType),
    recommendations,
    dangerAssessment,
    emergencyAlert: EmergencyAlertEngine.buildPayload({
      danger: dangerAssessment,
      location: base.location || base.district,
      cropType: input.cropType,
      recommendations,
    }),
  };
};

export class WeatherService {
  static async getWeatherForLocation(locationInput?: WeatherLocationInput | string | null): Promise<WeatherReport> {
    const input = normalizeLocationInput(locationInput);
    let cachedWeather: WeatherCacheRecord | null = null;

  const cacheDistrict = input.district || "Gujarat";

    try {
      const { data } = await supabase
        .from("weather_cache")
        .select("*")
        .ilike("district", cacheDistrict)
        .order("fetched_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      cachedWeather = (data as WeatherCacheRecord | null) || null;
    } catch (error) {
      console.warn("Weather cache lookup failed, using live forecast:", error);
    }

    if (!cachedWeather) {
      cachedWeather = readOfflineWeather(input);
    }

    if (cachedWeather) {
      const hasForecast = hasUsableForecast(cachedWeather);
      const matchesLocation = cacheMatchesInput(cachedWeather, input);
      const googleWeatherEnabled = Boolean(getGoogleWeatherApiKey());
      const providerMatches = !googleWeatherEnabled || cachedWeather.provider === "google_weather";
      if (providerMatches && matchesLocation && hasForecast && cacheAge(cachedWeather.fetched_at) < CACHE_DURATION_MS) {
        return toReport(cachedWeather, input, { isCached: true, isStale: false });
      }
    }

    let freshWeather: WeatherCacheInsert;
    try {
      freshWeather = await fetchGoogleWeatherForecast(input);
    } catch (error) {
      console.warn("Google Weather forecast unavailable, falling back to Open-Meteo:", error);
      try {
        freshWeather = await fetchOpenMeteoForecast(input);
      } catch (fallbackError) {
        console.warn("Open-Meteo forecast unavailable, using cached weather:", fallbackError);
        if (cachedWeather && cacheMatchesInput(cachedWeather, input) && hasUsableForecast(cachedWeather)) {
          return toReport(cachedWeather, input, { isCached: true, isStale: true });
        }
        throw fallbackError;
      }
    }
    freshWeather = smoothFreshWeather(freshWeather, cachedWeather);
    writeOfflineWeather(input, freshWeather);

    try {
      const { data: upsertedWeather, error } = await supabase
        .from("weather_cache")
        .upsert(freshWeather, { onConflict: "location,latitude,longitude" })
        .select("*")
        .single();

      if (!error && upsertedWeather) {
        return toReport(upsertedWeather as WeatherCacheRecord, input, { isCached: false, isStale: false });
      }
    } catch (error) {
      console.warn("Weather cache save failed, showing live forecast:", error);
    }

    if (cachedWeather && cacheMatchesInput(cachedWeather, input) && hasUsableForecast(cachedWeather)) {
      return toReport(cachedWeather, input, { isCached: true, isStale: true });
    }

    return toReport({ id: "live", ...freshWeather } as WeatherCacheRecord, input, { isCached: false, isStale: false });
  }

  static async getWeatherForDistrict(districtInput?: string | null): Promise<WeatherReport> {
    return this.getWeatherForLocation({ district: districtInput || null, state: DEFAULT_LOCATION.state });
  }
}
