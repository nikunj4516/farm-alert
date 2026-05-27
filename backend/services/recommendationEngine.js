import { SmartCropAlertService } from "./smartCropAlertService.js";

export class RecommendationEngine {
  static generate(weather, cropName, alerts) {
    const smartAlerts = alerts || SmartCropAlertService.generate(weather, cropName);
    const recommendations = smartAlerts
      .filter((alert) => alert.type !== "safe_weather")
      .map((alert, index) => ({
        id: `${alert.type}-${index}`,
        actionType: alert.type,
        priority: alert.priority,
        message: alert.recommendation,
        sourceAlertType: alert.type,
      }));

    if (recommendations.length) return recommendations.slice(0, 4);

    return [
      { id: "monitor-field", actionType: "monitoring", priority: 20, message: "Continue normal field monitoring." },
      { id: "check-soil", actionType: "irrigation", priority: 18, message: "Check soil moisture before irrigation." },
      { id: "crop-stage", actionType: "crop_stage", priority: 15, message: "Review crop-stage farming tips for the next operation." },
    ];
  }
}
