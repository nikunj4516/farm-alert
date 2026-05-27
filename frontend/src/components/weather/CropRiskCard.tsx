import type { SmartAgricultureAlert } from "@/services/agricultureWeatherRules";
import { getCropWeatherThreshold } from "@/services/agricultureWeatherRules";
import type { CropRiskProfile } from "@/services/cropRiskEngine";
import { useLanguage } from "@/contexts/LanguageContext";

interface CropRiskCardProps {
  cropType?: string | null;
  alerts: SmartAgricultureAlert[];
  riskProfile?: CropRiskProfile;
}

const CropRiskCard = ({ cropType, alerts, riskProfile }: CropRiskCardProps) => {
  const { t } = useLanguage();
  const threshold = getCropWeatherThreshold(cropType);
  const topRisk = alerts[0];
  const crop = t(`weather.intelligence.crops.${threshold.cropName}`);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">{t("weather.intelligence.cropRiskProfile")}</p>
          <h2 className="mt-1 text-lg font-black text-foreground">{crop}</h2>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
          {t(`weather.intelligence.severity.${topRisk?.severity || "LOW"}`)} {t("weather.intelligence.risk")}
        </span>
      </div>

      {riskProfile && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            ["heatRisk", riskProfile.heatRisk],
            ["pestRisk", riskProfile.pestRisk],
            ["rainfallRisk", riskProfile.rainfallRisk],
            ["diseaseRisk", riskProfile.diseaseRisk],
          ].map(([key, value]) => (
            <div key={key} className="rounded-xl bg-primary/5 p-3">
              <p className="text-xs font-bold text-muted-foreground">{t(`weather.intelligence.riskProfile.${key}`)}</p>
              <p className="mt-1 text-sm font-black text-primary">{t(`weather.intelligence.severity.${value}`)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="text-xs font-bold text-muted-foreground">{t("weather.intelligence.heatLimit")}</p>
          <p className="mt-1 text-lg font-black text-foreground">{threshold.maxTemperature}°C</p>
        </div>
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="text-xs font-bold text-muted-foreground">{t("weather.intelligence.humidityRisk")}</p>
          <p className="mt-1 text-lg font-black text-foreground">{threshold.idealHumidity}%</p>
        </div>
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="text-xs font-bold text-muted-foreground">{t("weather.intelligence.rainTolerance")}</p>
          <p className="mt-1 text-lg font-black text-foreground">{threshold.rainfallTolerance} {t("weather.intelligence.units.mm")}</p>
        </div>
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="text-xs font-bold text-muted-foreground">{t("weather.intelligence.windTolerance")}</p>
          <p className="mt-1 text-lg font-black text-foreground">{threshold.windTolerance} {t("weather.intelligence.units.kmh")}</p>
        </div>
      </div>
    </section>
  );
};

export default CropRiskCard;
