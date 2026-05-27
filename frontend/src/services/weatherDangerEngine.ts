import type { WeatherReport } from "@/services/weatherService";
import { CropWeatherRulesEngine } from "@/services/cropWeatherRulesEngine";

export type WeatherDangerStatus = "GREEN" | "YELLOW" | "RED";

export interface WeatherDangerAssessment {
  status: WeatherDangerStatus;
  dangerScore: number;
  alertLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  primaryDanger: string;
  message: string;
  shouldPlaySound: boolean;
  shouldPin: boolean;
  shouldNotify: boolean;
}

const scoreForSeverity = (severity: string) => ({ LOW: 15, MEDIUM: 45, HIGH: 72, CRITICAL: 95 })[severity] || 10;

export class WeatherDangerEngine {
  static assess(weather: Partial<WeatherReport>, cropType?: string | null): WeatherDangerAssessment {
    const signals = CropWeatherRulesEngine.evaluate(weather, cropType);
    const stormSignal = (weather.weather_condition || "").toLowerCase().includes("thunder") ? 90 : 0;
    const dangerScore = Math.max(
      scoreForSeverity(signals.heatSeverity),
      scoreForSeverity(signals.rainSeverity),
      scoreForSeverity(signals.humiditySeverity),
      scoreForSeverity(signals.windSeverity),
      scoreForSeverity(signals.frostSeverity),
      signals.uvIndex >= 10 ? 76 : signals.uvIndex >= 8 ? 54 : 10,
      stormSignal
    );

    const status: WeatherDangerStatus = dangerScore >= 75 ? "RED" : dangerScore >= 45 ? "YELLOW" : "GREEN";
    const alertLevel = dangerScore >= 90 ? "CRITICAL" : dangerScore >= 75 ? "HIGH" : dangerScore >= 45 ? "MEDIUM" : "LOW";
    const primaryDanger =
      scoreForSeverity(signals.rainSeverity) === dangerScore ? "rain" :
      scoreForSeverity(signals.windSeverity) === dangerScore ? "wind" :
      scoreForSeverity(signals.humiditySeverity) === dangerScore ? "humidity" :
      scoreForSeverity(signals.frostSeverity) === dangerScore ? "frost" :
      stormSignal === dangerScore ? "storm" :
      scoreForSeverity(signals.heatSeverity) === dangerScore ? "heat" :
      signals.uvIndex >= 8 ? "uv" : "safe";

    return {
      status,
      dangerScore,
      alertLevel,
      primaryDanger,
      message: status === "RED" ? "red" : status === "YELLOW" ? "yellow" : "green",
      shouldPlaySound: status === "RED",
      shouldPin: status !== "GREEN",
      shouldNotify: status === "RED",
    };
  }
}
