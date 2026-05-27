import type { FarmingRecommendation } from "@/services/recommendationEngine";
import type { WeatherDangerAssessment } from "@/services/weatherDangerEngine";

export interface EmergencyAlertPayload {
  isEmergency: boolean;
  notificationChannels: Array<"dashboard" | "whatsapp" | "sms">;
  whatsappMessage: string | null;
  smsMessage: string | null;
}

export class EmergencyAlertEngine {
  static buildPayload(params: {
    danger: WeatherDangerAssessment;
    location?: string | null;
    cropType?: string | null;
    recommendations?: FarmingRecommendation[];
  }): EmergencyAlertPayload {
    const { danger, location, cropType, recommendations = [] } = params;
    const isEmergency = danger.status === "RED";
    if (!isEmergency) {
      return { isEmergency: false, notificationChannels: ["dashboard"], whatsappMessage: null, smsMessage: null };
    }

    const actions = recommendations.slice(0, 4).map((item) => `- ${item.message}`).join("\n");
    const place = location || "your village";
    const crop = cropType || "your crop";

    return {
      isEmergency: true,
      notificationChannels: ["dashboard", "whatsapp", "sms"],
      whatsappMessage: `RED ALERT\nDangerous weather expected in ${place}.\n${crop} crop damage risk is HIGH.\n\nRecommended Actions:\n${actions}`,
      smsMessage: `FarmAlert WARNING: Dangerous weather expected in ${place}. ${crop} crop damage risk HIGH. Open app immediately.`,
    };
  }
}
