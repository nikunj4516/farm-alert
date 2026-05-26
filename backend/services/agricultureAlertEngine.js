import { generateSmartAgricultureAlerts } from "./agricultureWeatherRules.js";

export class AgricultureAlertEngine {
  static generate({ weather, cropName }) {
    return generateSmartAgricultureAlerts({ weather, cropName });
  }
}
