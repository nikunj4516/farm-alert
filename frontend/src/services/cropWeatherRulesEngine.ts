import type { HourlyForecast, WeatherForecastDay, WeatherReport } from "@/services/weatherService";
import { getCropWeatherThreshold, type SmartAlertSeverity } from "@/services/agricultureWeatherRules";

export interface CropWeatherSignals {
  cropName: string;
  maxTemperature: number;
  minTemperature: number;
  humidity: number;
  rainProbability: number;
  rainfall: number;
  windSpeed: number;
  uvIndex: number;
  heatSeverity: SmartAlertSeverity;
  rainSeverity: SmartAlertSeverity;
  humiditySeverity: SmartAlertSeverity;
  windSeverity: SmartAlertSeverity;
  frostSeverity: SmartAlertSeverity;
}

const max = <T extends HourlyForecast | WeatherForecastDay>(items: T[], key: keyof T) =>
  Math.max(...items.map((item) => Number(item[key] || 0)), 0);

const minPositive = <T extends HourlyForecast | WeatherForecastDay>(items: T[], key: keyof T) => {
  const values = items.map((item) => Number(item[key])).filter((value) => Number.isFinite(value) && value > -50);
  return values.length ? Math.min(...values) : 99;
};

const severity = (ratio: number): SmartAlertSeverity => {
  if (ratio >= 1.35) return "CRITICAL";
  if (ratio >= 1.1) return "HIGH";
  if (ratio >= 0.85) return "MEDIUM";
  return "LOW";
};

export class CropWeatherRulesEngine {
  static evaluate(weather: Partial<WeatherReport>, cropType?: string | null): CropWeatherSignals {
    const threshold = getCropWeatherThreshold(cropType);
    const hourly = weather.hourlyForecast || [];
    const forecast = weather.forecast || [];
    const maxTemperature = Math.max(Number(weather.temperature || 0), max(forecast.slice(0, 3), "maxTemperature"));
    const minTemperature = Math.min(Number(weather.temperature || 99), minPositive(forecast.slice(0, 3), "minTemperature"));
    const humidity = Math.max(Number(weather.humidity || 0), max(hourly.slice(0, 24), "humidity"));
    const rainProbability = Math.max(Number(weather.precipitation_probability || 0), max(hourly.slice(0, 24), "precipitationProbability"));
    const rainfall = Math.max(Number(weather.rainfall || 0), max(forecast.slice(0, 3), "rainfall"));
    const windSpeed = Math.max(Number(weather.wind_speed || 0), max(hourly.slice(0, 24), "windSpeed"));
    const uvIndex = Math.max(Number(weather.uv_index || 0), max(forecast.slice(0, 3), "uvIndex"));

    return {
      cropName: threshold.cropName,
      maxTemperature,
      minTemperature,
      humidity,
      rainProbability,
      rainfall,
      windSpeed,
      uvIndex,
      heatSeverity: severity(maxTemperature / Math.max(threshold.maxTemperature, 1)),
      rainSeverity: severity(Math.max(rainfall / Math.max(threshold.rainfallTolerance, 1), rainProbability / 80)),
      humiditySeverity: severity(humidity / Math.max(threshold.idealHumidity, 1)),
      windSeverity: severity(windSpeed / Math.max(threshold.windTolerance, 1)),
      frostSeverity: minTemperature <= threshold.minTemperature ? threshold.frostRiskLevel : "LOW",
    };
  }
}
