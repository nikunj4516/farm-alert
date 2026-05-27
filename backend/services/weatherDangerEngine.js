import { CropWeatherRulesEngine } from "./cropWeatherRulesEngine.js";

const scoreForSeverity = (severity) => ({ LOW: 15, MEDIUM: 45, HIGH: 72, CRITICAL: 95 })[severity] || 10;

export class WeatherDangerEngine {
  static assess(weather, cropName) {
    const signals = CropWeatherRulesEngine.evaluate(weather, cropName);
    const stormSignal = String(weather.weatherCondition || "").toLowerCase().includes("thunder") ? 90 : 0;
    const dangerScore = Math.max(
      scoreForSeverity(signals.heatSeverity),
      scoreForSeverity(signals.rainSeverity),
      scoreForSeverity(signals.humiditySeverity),
      scoreForSeverity(signals.windSeverity),
      scoreForSeverity(signals.frostSeverity),
      signals.uvIndex >= 10 ? 76 : signals.uvIndex >= 8 ? 54 : 10,
      stormSignal
    );
    const status = dangerScore >= 75 ? "RED" : dangerScore >= 45 ? "YELLOW" : "GREEN";
    const alertLevel = dangerScore >= 90 ? "CRITICAL" : dangerScore >= 75 ? "HIGH" : dangerScore >= 45 ? "MEDIUM" : "LOW";

    return {
      status,
      dangerScore,
      alertLevel,
      primaryDanger: status === "GREEN" ? "safe" : "weather",
      message: status === "RED" ? "red" : status === "YELLOW" ? "yellow" : "green",
      shouldPlaySound: status === "RED",
      shouldPin: status !== "GREEN",
      shouldNotify: status === "RED",
    };
  }
}
