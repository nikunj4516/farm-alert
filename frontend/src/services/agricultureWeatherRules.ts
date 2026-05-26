import type { HourlyForecast, WeatherForecastDay, WeatherReport } from "@/services/weatherService";

export type SmartAlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type SmartAlertKind =
  | "heatwave"
  | "heavy_rain"
  | "rain"
  | "pest_risk"
  | "irrigation"
  | "frost"
  | "humidity"
  | "strong_wind"
  | "disease_risk"
  | "uv_stress"
  | "safe_weather";

export interface CropWeatherThreshold {
  cropName: string;
  minTemperature: number;
  maxTemperature: number;
  idealHumidity: number;
  rainfallTolerance: number;
  windTolerance: number;
  heatwaveRiskLevel: SmartAlertSeverity;
  frostRiskLevel: SmartAlertSeverity;
  heatSensitivity: SmartAlertSeverity;
}

export interface SmartAgricultureAlert {
  type: SmartAlertKind;
  severity: SmartAlertSeverity;
  title: string;
  message: string;
  recommendation: string;
  metricLabel: string;
  metricValue: string;
  color: "green" | "yellow" | "orange" | "red" | "blue";
  priority: number;
}

const cropThresholds: Record<string, CropWeatherThreshold> = {
  cotton: {
    cropName: "Cotton",
    minTemperature: 16,
    maxTemperature: 40,
    idealHumidity: 75,
    rainfallTolerance: 35,
    windTolerance: 38,
    heatwaveRiskLevel: "HIGH",
    frostRiskLevel: "HIGH",
    heatSensitivity: "MEDIUM",
  },
  rice: {
    cropName: "Rice",
    minTemperature: 18,
    maxTemperature: 38,
    idealHumidity: 85,
    rainfallTolerance: 70,
    windTolerance: 42,
    heatwaveRiskLevel: "MEDIUM",
    frostRiskLevel: "HIGH",
    heatSensitivity: "MEDIUM",
  },
  wheat: {
    cropName: "Wheat",
    minTemperature: 7,
    maxTemperature: 35,
    idealHumidity: 70,
    rainfallTolerance: 25,
    windTolerance: 36,
    heatwaveRiskLevel: "HIGH",
    frostRiskLevel: "CRITICAL",
    heatSensitivity: "HIGH",
  },
  groundnut: {
    cropName: "Groundnut",
    minTemperature: 15,
    maxTemperature: 38,
    idealHumidity: 70,
    rainfallTolerance: 45,
    windTolerance: 36,
    heatwaveRiskLevel: "HIGH",
    frostRiskLevel: "MEDIUM",
    heatSensitivity: "HIGH",
  },
  sugarcane: {
    cropName: "Sugarcane",
    minTemperature: 16,
    maxTemperature: 40,
    idealHumidity: 80,
    rainfallTolerance: 65,
    windTolerance: 34,
    heatwaveRiskLevel: "MEDIUM",
    frostRiskLevel: "HIGH",
    heatSensitivity: "MEDIUM",
  },
  vegetables: {
    cropName: "Vegetables",
    minTemperature: 12,
    maxTemperature: 34,
    idealHumidity: 72,
    rainfallTolerance: 25,
    windTolerance: 28,
    heatwaveRiskLevel: "CRITICAL",
    frostRiskLevel: "HIGH",
    heatSensitivity: "CRITICAL",
  },
};

const defaultThreshold: CropWeatherThreshold = {
  cropName: "Crop",
  minTemperature: 12,
  maxTemperature: 38,
  idealHumidity: 75,
  rainfallTolerance: 35,
  windTolerance: 35,
  heatwaveRiskLevel: "HIGH",
  frostRiskLevel: "HIGH",
  heatSensitivity: "HIGH",
};

const cropKey = (crop?: string | null) => {
  const normalized = crop?.toLowerCase() || "";
  if (normalized.includes("vegetable")) return "vegetables";
  if (normalized.includes("cotton")) return "cotton";
  if (normalized.includes("rice") || normalized.includes("paddy")) return "rice";
  if (normalized.includes("wheat")) return "wheat";
  if (normalized.includes("groundnut")) return "groundnut";
  if (normalized.includes("sugarcane")) return "sugarcane";
  return "default";
};

export const getCropWeatherThreshold = (crop?: string | null): CropWeatherThreshold =>
  cropThresholds[cropKey(crop)] || { ...defaultThreshold, cropName: crop || defaultThreshold.cropName };

const max = <T extends HourlyForecast | WeatherForecastDay>(items: T[], key: keyof T) =>
  Math.max(...items.map((item) => Number(item[key] || 0)), 0);

const minPositive = <T extends HourlyForecast | WeatherForecastDay>(items: T[], key: keyof T) => {
  const values = items.map((item) => Number(item[key])).filter((value) => Number.isFinite(value) && value > -50);
  return values.length ? Math.min(...values) : 99;
};

const colorForSeverity = (severity: SmartAlertSeverity, type?: SmartAlertKind): SmartAgricultureAlert["color"] => {
  if (type === "rain" || type === "heavy_rain") return severity === "LOW" ? "blue" : severity === "MEDIUM" ? "yellow" : "red";
  if (severity === "CRITICAL") return "red";
  if (severity === "HIGH") return "orange";
  if (severity === "MEDIUM") return "yellow";
  return "green";
};

const priorityForSeverity = (severity: SmartAlertSeverity) =>
  ({ CRITICAL: 100, HIGH: 80, MEDIUM: 50, LOW: 20 })[severity];

const createAlert = (
  type: SmartAlertKind,
  severity: SmartAlertSeverity,
  title: string,
  message: string,
  recommendation: string,
  metricLabel: string,
  metricValue: string
): SmartAgricultureAlert => ({
  type,
  severity,
  title,
  message,
  recommendation,
  metricLabel,
  metricValue,
  color: colorForSeverity(severity, type),
  priority: priorityForSeverity(severity),
});

export const generateSmartAgricultureAlerts = (weather: Partial<WeatherReport>, cropType?: string | null): SmartAgricultureAlert[] => {
  const crop = cropType || "your crop";
  const threshold = getCropWeatherThreshold(cropType);
  const hourly = weather.hourlyForecast || [];
  const forecast = weather.forecast || [];

  const rainProbability = Math.max(Number(weather.precipitation_probability || 0), max(hourly.slice(0, 24), "precipitationProbability"));
  const rainfall = Math.max(Number(weather.rainfall || 0), max(forecast.slice(0, 3), "rainfall"));
  const humidity = Math.max(Number(weather.humidity || 0), max(hourly.slice(0, 24), "humidity"));
  const maxTemperature = Math.max(Number(weather.temperature || 0), max(forecast.slice(0, 3), "maxTemperature"));
  const minTemperature = Math.min(Number(weather.temperature || 99), minPositive(forecast.slice(0, 3), "minTemperature"));
  const windSpeed = Math.max(Number(weather.wind_speed || 0), max(hourly.slice(0, 24), "windSpeed"));
  const uvIndex = Math.max(Number(weather.uv_index || 0), max(forecast.slice(0, 3), "uvIndex"));
  const alerts: SmartAgricultureAlert[] = [];

  if (maxTemperature >= Math.max(40, threshold.maxTemperature + 2)) {
    const severity = maxTemperature >= 44 ? "CRITICAL" : threshold.heatwaveRiskLevel;
    alerts.push(createAlert(
      "heatwave",
      severity,
      "Extreme heat risk detected",
      `${crop} may face moisture stress because temperature may reach ${Math.round(maxTemperature)}°C.`,
      "Use light irrigation in the evening or early morning. Avoid pesticide spraying during peak afternoon heat.",
      "Max temp",
      `${Math.round(maxTemperature)}°C`
    ));
  } else if (maxTemperature >= threshold.maxTemperature) {
    alerts.push(createAlert(
      "irrigation",
      threshold.heatSensitivity === "CRITICAL" ? "HIGH" : "MEDIUM",
      "Irrigation planning needed",
      `${crop} is near its heat tolerance level.`,
      "Check soil moisture and schedule irrigation outside hot afternoon hours.",
      "Temp",
      `${Math.round(maxTemperature)}°C`
    ));
  }

  if (rainProbability >= 80 || rainfall >= Math.max(50, threshold.rainfallTolerance)) {
    alerts.push(createAlert(
      "heavy_rain",
      rainfall >= 80 || rainProbability >= 90 ? "CRITICAL" : "HIGH",
      "Heavy rain may affect field work",
      `Rain chance is high and ${crop} may face waterlogging or spray loss.`,
      "Avoid pesticide and fertilizer spraying. Clean drainage channels before rain starts.",
      "Rain chance",
      `${Math.round(rainProbability)}%`
    ));
  } else if (rainProbability >= 55 || rainfall >= 10) {
    alerts.push(createAlert(
      "rain",
      "LOW",
      "Light to moderate rain possible",
      "Rain may interrupt spraying or fertilizer work.",
      "Plan field operations after the rain window and monitor soil moisture.",
      "Rain chance",
      `${Math.round(rainProbability)}%`
    ));
  }

  if (windSpeed >= threshold.windTolerance) {
    const severity = windSpeed >= 55 ? "CRITICAL" : "HIGH";
    alerts.push(createAlert(
      "strong_wind",
      severity,
      "Strong wind crop damage risk",
      `${crop} may face lodging, leaf tearing, or support damage during strong winds.`,
      "Support vegetable creepers, sugarcane, and young plants. Avoid spraying in windy hours.",
      "Wind",
      `${Math.round(windSpeed)} km/h`
    ));
  }

  if (humidity >= threshold.idealHumidity) {
    const cottonRisk = cropKey(cropType) === "cotton";
    alerts.push(createAlert(
      cottonRisk ? "pest_risk" : "humidity",
      cottonRisk && humidity >= 82 ? "HIGH" : "MEDIUM",
      cottonRisk ? "Whitefly and fungal risk in cotton" : "High humidity disease risk",
      cottonRisk
        ? "High humidity can increase whitefly attacks and fungal disease risk in cotton."
        : `High humidity can increase fungal disease risk in ${crop}.`,
      "Inspect leaves carefully this week, improve field aeration, and avoid excess irrigation.",
      "Humidity",
      `${Math.round(humidity)}%`
    ));
  }

  if (minTemperature <= threshold.minTemperature) {
    alerts.push(createAlert(
      "frost",
      minTemperature <= 5 ? "CRITICAL" : threshold.frostRiskLevel,
      "Low temperature crop stress risk",
      `${crop} may face cold stress because temperature may drop near ${Math.round(minTemperature)}°C.`,
      "Protect seedlings, avoid late evening irrigation in frost-prone fields, and cover nursery beds where possible.",
      "Min temp",
      `${Math.round(minTemperature)}°C`
    ));
  }

  if (uvIndex >= 8) {
    alerts.push(createAlert(
      "uv_stress",
      uvIndex >= 10 ? "HIGH" : "MEDIUM",
      "High UV and plant stress risk",
      "Strong sunlight can increase moisture loss from soil and crop leaves.",
      "Plan irrigation early and avoid transplanting or spraying during harsh sunlight.",
      "UV index",
      `${Math.round(uvIndex)}`
    ));
  }

  if (!alerts.length) {
    alerts.push(createAlert(
      "safe_weather",
      "LOW",
      "No major crop-weather risk now",
      "Current forecast does not show a major danger for your selected crop.",
      "Continue normal field monitoring and follow crop-stage based farming tips.",
      "Status",
      "Safe"
    ));
  }

  return alerts.sort((a, b) => b.priority - a.priority).slice(0, 6);
};

