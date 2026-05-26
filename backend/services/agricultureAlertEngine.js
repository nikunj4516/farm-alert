const alert = (type, severity, message, recommendation) => ({
  type,
  severity,
  message,
  recommendation,
});

const max = (items, key) =>
  Math.max(...items.map((item) => Number(item?.[key] || 0)), 0);

export class AgricultureAlertEngine {
  static generate({ weather, cropName }) {
    const crop = String(cropName || "").toLowerCase();
    const hourly = weather.hourlyForecast || [];
    const daily = weather.forecast || [];
    const alerts = [];

    const maxRainProbability = max(hourly.slice(0, 24), "precipitationProbability");
    const maxRainfall = max(daily.slice(0, 3), "rainfall");
    const maxHumidity = Math.max(Number(weather.humidity || 0), max(hourly.slice(0, 24), "humidity"));
    const maxTemp = Math.max(Number(weather.temperature || 0), max(daily.slice(0, 3), "maxTemperature"));
    const maxWind = Math.max(Number(weather.windSpeed || 0), max(hourly.slice(0, 24), "windSpeed"));

    if (maxRainfall >= 64.5 || maxRainProbability >= 85) {
      alerts.push(alert(
        "heavy_rain",
        "red",
        "Heavy rainfall is likely in your area.",
        "Avoid pesticide spraying and keep drainage channels open."
      ));
    } else if (maxRainfall >= 15.6 || maxRainProbability >= 65) {
      alerts.push(alert(
        "rain",
        "orange",
        "Rain is likely soon.",
        "Plan fertilizer and pesticide work after the rain window."
      ));
    }

    if (maxTemp >= 40) {
      alerts.push(alert(
        "heatwave",
        maxTemp >= 45 ? "red" : "orange",
        "High temperature can stress crops.",
        "Irrigate during early morning or evening and avoid mid-day field operations."
      ));
    }

    if (maxWind >= 40) {
      alerts.push(alert(
        "strong_wind",
        maxWind >= 62 ? "red" : "orange",
        "Strong winds may damage standing crops.",
        "Support vegetable creepers and avoid spraying during windy hours."
      ));
    }

    if (maxHumidity >= 75 && crop.includes("cotton")) {
      alerts.push(alert(
        "pest_risk",
        "yellow",
        "High humidity can increase whitefly and fungal risk in cotton.",
        "Inspect leaf undersides and avoid excess irrigation."
      ));
    }

    if (maxHumidity >= 80 && crop.includes("wheat")) {
      alerts.push(alert(
        "disease_risk",
        "yellow",
        "High humidity can increase rust risk in wheat.",
        "Scout fields for yellow or brown rust patches."
      ));
    }

    if (crop.includes("rice") && maxRainfall >= 15) {
      alerts.push(alert(
        "crop_recommendation",
        "yellow",
        "Rainfall may raise water levels in rice fields.",
        "Maintain field bunds but drain excess standing water if seedlings are young."
      ));
    }

    if (crop.includes("vegetable") && maxWind >= 30) {
      alerts.push(alert(
        "crop_safety",
        "yellow",
        "Vegetable crops can be damaged by gusty wind.",
        "Check staking, trellis support, and nursery covers."
      ));
    }

    if (!alerts.length) {
      alerts.push(alert(
        "safe_weather",
        "green",
        "No major crop-weather risk detected right now.",
        "Continue normal field monitoring and irrigation planning."
      ));
    }

    return alerts;
  }
}
