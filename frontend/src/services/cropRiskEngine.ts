import type { SmartAlertSeverity } from "@/services/agricultureWeatherRules";
import type { WeatherReport } from "@/services/weatherService";
import { CropWeatherRulesEngine } from "@/services/cropWeatherRulesEngine";

export interface CropRiskProfile {
  cropName: string;
  heatRisk: SmartAlertSeverity;
  pestRisk: SmartAlertSeverity;
  rainfallRisk: SmartAlertSeverity;
  diseaseRisk: SmartAlertSeverity;
  irrigationStress: SmartAlertSeverity;
  windDamageRisk: SmartAlertSeverity;
  cropDamageProbability: number;
  updatedAt: string;
}

const scoreForSeverity = (severity: SmartAlertSeverity) => ({ LOW: 15, MEDIUM: 45, HIGH: 72, CRITICAL: 92 })[severity];

export class CropRiskEngine {
  static calculate(weather: Partial<WeatherReport>, cropType?: string | null): CropRiskProfile {
    const signals = CropWeatherRulesEngine.evaluate(weather, cropType);
    const diseaseRisk = signals.humiditySeverity;
    const pestRisk = signals.humidity >= 75 ? signals.humiditySeverity : "LOW";
    const irrigationStress = signals.heatSeverity === "LOW" && signals.rainSeverity !== "LOW" ? "LOW" : signals.heatSeverity;
    const cropDamageProbability = Math.round(
      Math.max(
        scoreForSeverity(signals.heatSeverity),
        scoreForSeverity(signals.rainSeverity),
        scoreForSeverity(signals.windSeverity),
        scoreForSeverity(diseaseRisk),
        scoreForSeverity(signals.frostSeverity)
      )
    );

    return {
      cropName: signals.cropName,
      heatRisk: signals.heatSeverity,
      pestRisk,
      rainfallRisk: signals.rainSeverity,
      diseaseRisk,
      irrigationStress,
      windDamageRisk: signals.windSeverity,
      cropDamageProbability,
      updatedAt: new Date().toISOString(),
    };
  }
}
