import axios from "axios";
import { supabaseAdmin } from "../utils/supabaseClient.js";
import { LocationService } from "./locationService.js";
import { AgricultureAlertEngine } from "./agricultureAlertEngine.js";
import { CropRiskEngine } from "./cropRiskEngine.js";
import { EmergencyAlertEngine } from "./emergencyAlertEngine.js";
import { RecommendationEngine } from "./recommendationEngine.js";
import { WeatherDangerEngine } from "./weatherDangerEngine.js";

const CACHE_MINUTES = Number(process.env.WEATHER_CACHE_MINUTES || 30);
const GOOGLE_WEATHER_BASE_URL = "https://weather.googleapis.com/v1";

const round = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 10) / 10 : null;
};

const conditionFromCode = (code) => {
  const value = Number(code);
  if (value === 0) return "Clear sky";
  if ([1, 2].includes(value)) return "Partly cloudy";
  if (value === 3) return "Overcast";
  if ([45, 48].includes(value)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(value)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(value)) return "Rain";
  if ([95, 96, 99].includes(value)) return "Thunderstorm";
  return "Cloudy";
};

const isFresh = (row) => {
  const staleAfter = row?.stale_after ? new Date(row.stale_after).getTime() : 0;
  return staleAfter > Date.now();
};

const googleWeatherApiKey = () => process.env.GOOGLE_WEATHER_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";

const googleConditionText = (condition) => {
  const text = condition?.description?.text;
  if (typeof text === "string" && text.trim()) return text;
  if (!condition?.type) return null;
  return String(condition.type)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const googleTemperature = (value) => round(value?.degrees);
const googleSpeed = (wind) => round(wind?.speed?.value);
const googleVisibility = (visibility) => round(visibility?.distance);
const googleRainfall = (precipitation) => round(precipitation?.qpf?.quantity);
const googlePrecipitationProbability = (precipitation) => round(precipitation?.probability?.percent);

const googleWeatherParams = (location, extra = {}) => ({
  key: googleWeatherApiKey(),
  "location.latitude": location.latitude,
  "location.longitude": location.longitude,
  unitsSystem: "METRIC",
  languageCode: "en",
  ...extra,
});

export class WeatherService {
  static async getCurrentWeather(locationInput, cropName, farmerId) {
    const location = await LocationService.getCoordinates(locationInput);
    if (!LocationService.validateLocation(location)) {
      throw new Error("Resolved location is invalid.");
    }

    const { data: cached } = await supabaseAdmin
      .from("weather_cache")
      .select("*")
      .eq("location", location.location)
      .maybeSingle();

    const googleEnabled = Boolean(googleWeatherApiKey());
    if (cached && isFresh(cached) && (!googleEnabled || cached.provider === "google_weather")) {
      const report = this.toWeatherReport(cached, cropName, true);
      await this.persistSmartAlerts({ farmerId, cropName, village: locationInput.village, location, report });
      return report;
    }

    const fresh = await this.fetchBestProvider(location);
    const staleAfter = new Date(Date.now() + CACHE_MINUTES * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from("weather_cache")
      .upsert(
        {
          district: locationInput.district || location.location,
          location: location.location,
          latitude: location.latitude,
          longitude: location.longitude,
          temperature: fresh.temperature,
          feels_like: fresh.feelsLike,
          humidity: fresh.humidity,
          rainfall: fresh.rainfall,
          wind_speed: fresh.windSpeed,
          weather_condition: fresh.weatherCondition,
          uv_index: fresh.uvIndex,
          precipitation_probability: fresh.precipitationProbability,
          cloud_coverage: fresh.cloudCoverage,
          visibility: fresh.visibility,
          forecast: fresh.forecast,
          forecast_json: fresh.forecast,
          hourly_json: fresh.hourlyForecast,
          alerts_json: fresh.providerAlerts,
          provider: fresh.provider,
          stale_after: staleAfter,
          fetched_at: new Date().toISOString(),
        },
        { onConflict: "location,latitude,longitude" }
      )
      .select("*")
      .single();

    if (error) throw error;
    const report = this.toWeatherReport(data, cropName, false);
    await this.persistSmartAlerts({ farmerId, cropName, village: locationInput.village, location, report });
    return report;
  }

  static async persistSmartAlerts({ farmerId, cropName, village, location, report }) {
    if (!farmerId || !report?.agricultureAlerts?.length) return;

    const cutoff = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const alertRows = [];
    const recommendedActions = report.recommendations || [];
    const danger = report.dangerAssessment;

    if (report.cropRiskProfile?.cropName) {
      const profile = report.cropRiskProfile;
      const { error: riskError } = await supabaseAdmin
        .from("crop_risk_profiles")
        .upsert(
          {
            crop_name: profile.cropName,
            heat_risk: profile.heatRisk,
            pest_risk: profile.pestRisk,
            rainfall_risk: profile.rainfallRisk,
            disease_risk: profile.diseaseRisk,
            irrigation_stress: profile.irrigationStress,
            wind_damage_risk: profile.windDamageRisk,
            crop_damage_probability: profile.cropDamageProbability,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "crop_name" }
        );

      if (riskError) {
        console.warn("Could not persist crop risk profile:", riskError.message);
      }
    }

    for (const alert of report.agricultureAlerts) {
      if (alert.type === "safe_weather") continue;

      const { data: existing } = await supabaseAdmin
        .from("weather_alerts")
        .select("id")
        .eq("farmer_id", farmerId)
        .eq("alert_type", alert.type)
        .gte("created_at", cutoff)
        .limit(1)
        .maybeSingle();

      if (existing) continue;

      alertRows.push({
        farmer_id: farmerId,
        crop_name: cropName || null,
        village: village || null,
        location: location.location,
        latitude: location.latitude,
        longitude: location.longitude,
        alert_type: alert.type,
        alert_level: danger?.status || null,
        danger_score: danger?.dangerScore || null,
        severity: alert.severity,
        alert_title: alert.title,
        alert_message: alert.message,
        recommendation: alert.recommendation,
        recommended_actions: recommendedActions.filter((item) => item.sourceAlertType === alert.type),
        notification_channels: report.emergencyAlert?.notificationChannels || ["dashboard"],
        whatsapp_message: report.emergencyAlert?.whatsappMessage || null,
        sms_message: report.emergencyAlert?.smsMessage || null,
        emergency_pinned: Boolean(report.dangerAssessment?.shouldPin),
        weather_condition: report.weatherCondition,
        metric_label: alert.metricLabel,
        metric_value: alert.metricValue,
        priority: alert.priority,
      });
    }

    if (!alertRows.length) return;

    const { error } = await supabaseAdmin.from("weather_alerts").insert(alertRows);
    if (error) {
      console.warn("Could not persist weather intelligence alerts:", error.message);
    }
  }

  static async fetchBestProvider(location) {
    if (googleWeatherApiKey()) {
      try {
        return await this.fetchGoogleWeather(location);
      } catch (error) {
        console.warn("Google Weather unavailable, falling back to Open-Meteo:", error.message);
      }
    }

    return this.fetchOpenMeteo(location);
  }

  static async fetchGoogleWeather(location) {
    const [currentResponse, dailyResponse, hourlyResponse] = await Promise.all([
      axios.get(`${GOOGLE_WEATHER_BASE_URL}/currentConditions:lookup`, {
        timeout: 15000,
        params: googleWeatherParams(location),
      }),
      axios.get(`${GOOGLE_WEATHER_BASE_URL}/forecast/days:lookup`, {
        timeout: 15000,
        params: googleWeatherParams(location, { days: 7, pageSize: 7 }),
      }),
      axios.get(`${GOOGLE_WEATHER_BASE_URL}/forecast/hours:lookup`, {
        timeout: 15000,
        params: googleWeatherParams(location, { hours: 48, pageSize: 48 }),
      }),
    ]);

    const current = currentResponse.data || {};
    const forecast = (dailyResponse.data?.forecastDays || []).slice(0, 7).map((day) => {
      const daytime = day.daytimeForecast || {};
      const nighttime = day.nighttimeForecast || {};
      const displayDate = day.displayDate || {};
      const minTemperature = googleTemperature(day.minTemperature);
      const maxTemperature = googleTemperature(day.maxTemperature);
      const weatherCondition = googleConditionText(daytime.weatherCondition);
      const date =
        displayDate.year && displayDate.month && displayDate.day
          ? `${displayDate.year}-${String(displayDate.month).padStart(2, "0")}-${String(displayDate.day).padStart(2, "0")}`
          : day.interval?.startTime;

      return {
        date,
        temperature: minTemperature !== null && maxTemperature !== null ? round((minTemperature + maxTemperature) / 2) : maxTemperature,
        minTemperature,
        maxTemperature,
        humidity: round(daytime.relativeHumidity ?? nighttime.relativeHumidity),
        rainfall: googleRainfall(daytime.precipitation),
        precipitationProbability: googlePrecipitationProbability(daytime.precipitation),
        windSpeed: googleSpeed(daytime.wind),
        uvIndex: round(daytime.uvIndex),
        weatherCondition,
      };
    });

    const hourlyForecast = (hourlyResponse.data?.forecastHours || []).slice(0, 48).map((hour) => ({
      time: hour.interval?.startTime,
      temperature: googleTemperature(hour.temperature),
      humidity: round(hour.relativeHumidity),
      rainfall: googleRainfall(hour.precipitation),
      precipitationProbability: googlePrecipitationProbability(hour.precipitation),
      windSpeed: googleSpeed(hour.wind),
      cloudCoverage: round(hour.cloudCover),
      visibility: googleVisibility(hour.visibility),
      weatherCondition: googleConditionText(hour.weatherCondition),
    }));

    return {
      provider: "google_weather",
      temperature: googleTemperature(current.temperature),
      feelsLike: googleTemperature(current.feelsLikeTemperature),
      humidity: round(current.relativeHumidity),
      rainfall: googleRainfall(current.precipitation),
      weatherCondition: googleConditionText(current.weatherCondition),
      windSpeed: googleSpeed(current.wind),
      cloudCoverage: round(current.cloudCover),
      visibility: googleVisibility(current.visibility),
      precipitationProbability: googlePrecipitationProbability(current.precipitation),
      uvIndex: round(current.uvIndex),
      forecast,
      hourlyForecast,
      providerAlerts: [],
    };
  }

  static async fetchOpenMeteo(location) {
    const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
      timeout: 15000,
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "precipitation",
          "rain",
          "weather_code",
          "cloud_cover",
          "wind_speed_10m",
          "visibility",
        ].join(","),
        hourly: [
          "temperature_2m",
          "relative_humidity_2m",
          "precipitation_probability",
          "precipitation",
          "rain",
          "weather_code",
          "cloud_cover",
          "wind_speed_10m",
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
        ].join(","),
        forecast_days: 7,
        timezone: "auto",
      },
    });

    const current = response.data.current || {};
    const daily = response.data.daily || {};
    const hourly = response.data.hourly || {};
    const forecast = (daily.time || []).slice(0, 7).map((date, index) => ({
      date,
      minTemperature: round(daily.temperature_2m_min?.[index]),
      maxTemperature: round(daily.temperature_2m_max?.[index]),
      rainfall: round(daily.precipitation_sum?.[index]),
      precipitationProbability: round(daily.precipitation_probability_max?.[index]),
      windSpeed: round(daily.wind_speed_10m_max?.[index]),
      uvIndex: round(daily.uv_index_max?.[index]),
      weatherCondition: conditionFromCode(daily.weather_code?.[index]),
    }));
    const hourlyForecast = (hourly.time || []).slice(0, 48).map((time, index) => ({
      time,
      temperature: round(hourly.temperature_2m?.[index]),
      humidity: round(hourly.relative_humidity_2m?.[index]),
      rainfall: round(hourly.rain?.[index] ?? hourly.precipitation?.[index]),
      precipitationProbability: round(hourly.precipitation_probability?.[index]),
      windSpeed: round(hourly.wind_speed_10m?.[index]),
      cloudCoverage: round(hourly.cloud_cover?.[index]),
      visibility: round(hourly.visibility?.[index]),
      weatherCondition: conditionFromCode(hourly.weather_code?.[index]),
    }));

    return {
      provider: "openmeteo",
      temperature: round(current.temperature_2m),
      feelsLike: round(current.apparent_temperature),
      humidity: round(current.relative_humidity_2m),
      rainfall: round(current.rain ?? current.precipitation),
      weatherCondition: conditionFromCode(current.weather_code),
      windSpeed: round(current.wind_speed_10m),
      cloudCoverage: round(current.cloud_cover),
      visibility: round(current.visibility),
      precipitationProbability: hourlyForecast[0]?.precipitationProbability ?? null,
      uvIndex: forecast[0]?.uvIndex ?? null,
      forecast,
      hourlyForecast,
      providerAlerts: [],
    };
  }

  static toWeatherReport(row, cropName, isCached) {
    const forecast = row.forecast_json || row.forecast || [];
    const hourlyForecast = row.hourly_json || [];
    const report = {
      id: row.id,
      location: row.location || row.district,
      latitude: row.latitude,
      longitude: row.longitude,
      temperature: row.temperature,
      feelsLike: row.feels_like,
      humidity: row.humidity,
      rainfall: row.rainfall,
      precipitationProbability: row.precipitation_probability,
      windSpeed: row.wind_speed,
      uvIndex: row.uv_index,
      cloudCoverage: row.cloud_coverage,
      visibility: row.visibility,
      weatherCondition: row.weather_condition,
      forecast,
      hourlyForecast,
      providerAlerts: row.alerts_json || [],
      fetchedAt: row.fetched_at,
      isCached,
    };
    const agricultureAlerts = AgricultureAlertEngine.generate({ weather: report, cropName });
    const recommendations = RecommendationEngine.generate(report, cropName, agricultureAlerts);
    const dangerAssessment = WeatherDangerEngine.assess(report, cropName);

    return {
      ...report,
      agricultureAlerts,
      cropRiskProfile: CropRiskEngine.calculate(report, cropName),
      recommendations,
      dangerAssessment,
      emergencyAlert: EmergencyAlertEngine.buildPayload({
        danger: dangerAssessment,
        location: report.location,
        cropName,
        recommendations,
      }),
    };
  }
}
