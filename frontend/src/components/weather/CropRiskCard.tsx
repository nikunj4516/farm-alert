import type { SmartAgricultureAlert } from "@/services/agricultureWeatherRules";
import { getCropWeatherThreshold } from "@/services/agricultureWeatherRules";

interface CropRiskCardProps {
  cropType?: string | null;
  alerts: SmartAgricultureAlert[];
}

const CropRiskCard = ({ cropType, alerts }: CropRiskCardProps) => {
  const threshold = getCropWeatherThreshold(cropType);
  const topRisk = alerts[0];

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Crop Risk Profile</p>
          <h2 className="mt-1 text-lg font-black text-foreground">{threshold.cropName}</h2>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
          {topRisk?.severity || "LOW"} RISK
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="text-xs font-bold text-muted-foreground">Heat limit</p>
          <p className="mt-1 text-lg font-black text-foreground">{threshold.maxTemperature}°C</p>
        </div>
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="text-xs font-bold text-muted-foreground">Humidity risk</p>
          <p className="mt-1 text-lg font-black text-foreground">{threshold.idealHumidity}%</p>
        </div>
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="text-xs font-bold text-muted-foreground">Rain tolerance</p>
          <p className="mt-1 text-lg font-black text-foreground">{threshold.rainfallTolerance} mm</p>
        </div>
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="text-xs font-bold text-muted-foreground">Wind tolerance</p>
          <p className="mt-1 text-lg font-black text-foreground">{threshold.windTolerance} km/h</p>
        </div>
      </div>
    </section>
  );
};

export default CropRiskCard;
