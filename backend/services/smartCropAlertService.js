import { generateSmartAgricultureAlerts } from "./agricultureWeatherRules.js";

export class SmartCropAlertService {
  static generate(weather, cropName) {
    return generateSmartAgricultureAlerts({ weather, cropName });
  }
}
