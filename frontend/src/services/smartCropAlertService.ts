import { generateSmartAgricultureAlerts } from "@/services/agricultureWeatherRules";
import type { WeatherReport } from "@/services/weatherService";

export class SmartCropAlertService {
  static generate(weather: Partial<WeatherReport>, cropType?: string | null) {
    return generateSmartAgricultureAlerts(weather, cropType);
  }
}
