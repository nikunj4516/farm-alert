import { SmartCropAlertService } from "./smartCropAlertService.js";

export class AgricultureAlertEngine {
  static generate({ weather, cropName }) {
    return SmartCropAlertService.generate(weather, cropName);
  }
}
