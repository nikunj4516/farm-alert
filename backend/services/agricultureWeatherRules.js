const cropThresholds = {
  cotton: {
    cropName: "Cotton",
    minTemperature: 16,
    maxTemperature: 40,
    idealHumidity: 75,
    rainfallTolerance: 35,
    windTolerance: 38,
    heatwaveRiskLevel: "HIGH",
    frostRiskLevel: "HIGH",
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
  },
};

const defaultThreshold = {
  cropName: "Crop",
  minTemperature: 12,
  maxTemperature: 38,
  idealHumidity: 75,
  rainfallTolerance: 35,
  windTolerance: 35,
  heatwaveRiskLevel: "HIGH",
  frostRiskLevel: "HIGH",
};

const cropKey = (cropName) => {
  const crop = String(cropName || "").toLowerCase();
  if (crop.includes("vegetable")) return "vegetables";
  if (crop.includes("cotton")) return "cotton";
  if (crop.includes("rice") || crop.includes("paddy")) return "rice";
  if (crop.includes("wheat")) return "wheat";
  if (crop.includes("groundnut")) return "groundnut";
  if (crop.includes("sugarcane")) return "sugarcane";
  return "default";
};

export const getCropWeatherThreshold = (cropName) =>
  cropThresholds[cropKey(cropName)] || { ...defaultThreshold, cropName: cropName || defaultThreshold.cropName };

const max = (items, key) => Math.max(...items.map((item) => Number(item?.[key] || 0)), 0);
const minPositive = (items, key) => {
  const values = items.map((item) => Number(item?.[key])).filter((value) => Number.isFinite(value) && value > -50);
  return values.length ? Math.min(...values) : 99;
};

const colorForSeverity = (severity, type) => {
  if (type === "rain" || type === "heavy_rain") return severity === "LOW" ? "blue" : severity === "MEDIUM" ? "yellow" : "red";
  if (severity === "CRITICAL") return "red";
  if (severity === "HIGH") return "orange";
  if (severity === "MEDIUM") return "yellow";
  return "green";
};

const priorityForSeverity = (severity) => ({ CRITICAL: 100, HIGH: 80, MEDIUM: 50, LOW: 20 })[severity] || 10;

const alert = (type, severity, title, message, recommendation, metricLabel, metricValue) => ({
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

export const generateSmartAgricultureAlerts = ({ weather, cropName }) => {
  const crop = cropName || "your crop";
  const threshold = getCropWeatherThreshold(cropName);
  const hourly = weather.hourlyForecast || [];
  const daily = weather.forecast || [];

  const rainProbability = Math.max(Number(weather.precipitationProbability || 0), max(hourly.slice(0, 24), "precipitationProbability"));
  const rainfall = Math.max(Number(weather.rainfall || 0), max(daily.slice(0, 3), "rainfall"));
  const humidity = Math.max(Number(weather.humidity || 0), max(hourly.slice(0, 24), "humidity"));
  const maxTemperature = Math.max(Number(weather.temperature || 0), max(daily.slice(0, 3), "maxTemperature"));
  const minTemperature = Math.min(Number(weather.temperature || 99), minPositive(daily.slice(0, 3), "minTemperature"));
  const windSpeed = Math.max(Number(weather.windSpeed || 0), max(hourly.slice(0, 24), "windSpeed"));
  const uvIndex = Math.max(Number(weather.uvIndex || 0), max(daily.slice(0, 3), "uvIndex"));
  const alerts = [];

  if (maxTemperature >= Math.max(40, threshold.maxTemperature + 2)) {
    alerts.push(alert(
      "heatwave",
      maxTemperature >= 44 ? "CRITICAL" : threshold.heatwaveRiskLevel,
      "Extreme heat risk detected",
      `${crop} may face moisture stress because temperature may reach ${Math.round(maxTemperature)}°C.`,
      "Use light irrigation in the evening or early morning. Avoid pesticide spraying during peak afternoon heat.",
      "Max temp",
      `${Math.round(maxTemperature)}°C`
    ));
  } else if (maxTemperature >= threshold.maxTemperature) {
    alerts.push(alert(
      "irrigation",
      "MEDIUM",
      "Irrigation planning needed",
      `${crop} is near its heat tolerance level.`,
      "Check soil moisture and schedule irrigation outside hot afternoon hours.",
      "Temp",
      `${Math.round(maxTemperature)}°C`
    ));
  }

  if (rainProbability >= 80 || rainfall >= Math.max(50, threshold.rainfallTolerance)) {
    alerts.push(alert(
      "heavy_rain",
      rainfall >= 80 || rainProbability >= 90 ? "CRITICAL" : "HIGH",
      "Heavy rain may affect field work",
      `Rain chance is high and ${crop} may face waterlogging or spray loss.`,
      "Avoid pesticide and fertilizer spraying. Clean drainage channels before rain starts.",
      "Rain chance",
      `${Math.round(rainProbability)}%`
    ));
  } else if (rainProbability >= 55 || rainfall >= 10) {
    alerts.push(alert(
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
    alerts.push(alert(
      "strong_wind",
      windSpeed >= 55 ? "CRITICAL" : "HIGH",
      "Strong wind crop damage risk",
      `${crop} may face lodging, leaf tearing, or support damage during strong winds.`,
      "Support vegetable creepers, sugarcane, and young plants. Avoid spraying in windy hours.",
      "Wind",
      `${Math.round(windSpeed)} km/h`
    ));
  }

  if (humidity >= threshold.idealHumidity) {
    const cottonRisk = cropKey(cropName) === "cotton";
    alerts.push(alert(
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
    alerts.push(alert(
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
    alerts.push(alert(
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
    alerts.push(alert(
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
