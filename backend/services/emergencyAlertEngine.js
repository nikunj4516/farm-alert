export class EmergencyAlertEngine {
  static buildPayload({ danger, location, cropName, recommendations = [] }) {
    if (danger.status !== "RED") {
      return { isEmergency: false, notificationChannels: ["dashboard"], whatsappMessage: null, smsMessage: null };
    }

    const actions = recommendations.slice(0, 4).map((item) => `- ${item.message}`).join("\n");
    const place = location || "your village";
    const crop = cropName || "your crop";

    return {
      isEmergency: true,
      notificationChannels: ["dashboard", "whatsapp", "sms"],
      whatsappMessage: `RED ALERT\nDangerous weather expected in ${place}.\n${crop} crop damage risk is HIGH.\n\nRecommended Actions:\n${actions}`,
      smsMessage: `FarmAlert WARNING: Dangerous weather expected in ${place}. ${crop} crop damage risk HIGH. Open app immediately.`,
    };
  }
}
