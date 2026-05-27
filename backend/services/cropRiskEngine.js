import { CropWeatherRulesEngine } from "./cropWeatherRulesEngine.js";

const score = (severity) => ({ LOW: 15, MEDIUM: 45, HIGH: 72, CRITICAL: 92 })[severity] || 10;

export class CropRiskEngine {
  static calculate(weather, cropName) {
    const signals = CropWeatherRulesEngine.evaluate(weather, cropName);
    const diseaseRisk = signals.humiditySeverity;
    const pestRisk = signals.humidity >= 75 ? signals.humiditySeverity : "LOW";
    const cropDamageProbability = Math.round(Math.max(
      score(signals.heatSeverity),
      score(signals.rainSeverity),
      score(signals.windSeverity),
      score(diseaseRisk),
      score(signals.frostSeverity)
    ));

    return {
      cropName: signals.cropName,
      heatRisk: signals.heatSeverity,
      pestRisk,
      rainfallRisk: signals.rainSeverity,
      diseaseRisk,
      irrigationStress: signals.heatSeverity,
      windDamageRisk: signals.windSeverity,
      cropDamageProbability,
      updatedAt: new Date().toISOString(),
    };
  }
}
