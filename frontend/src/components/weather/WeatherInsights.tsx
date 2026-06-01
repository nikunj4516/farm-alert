import type { WeatherReport } from "@/services/weatherService";
import { useLanguage } from "@/contexts/LanguageContext";

interface WeatherInsightsProps {
  weather: WeatherReport;
  cropType?: string | null;
}

const WeatherInsights = ({ weather, cropType }: WeatherInsightsProps) => {
  const { language, t } = useLanguage();
  const crop = cropType ? t(`weather.intelligence.crops.${cropType}`) : t("weather.intelligence.crops.your crop");
  const farmerInsight =
    language === "gu"
      ? `આજે હવામાનના આધારે ${crop} માટે ખેતરની ભેજ અને સિંચાઈ પર ધ્યાન રાખો.`
      : language === "hi"
        ? `आज मौसम के आधार पर ${crop} के लिए खेत की नमी और सिंचाई पर ध्यान रखें।`
        : `Based on today's weather, monitor soil moisture and irrigation for ${crop}.`;
  const insights = [
    { label: t("weather.intelligence.insightLabels.humidity"), value: `${Math.round(weather.humidity || 0)}%`, hint: (weather.humidity || 0) >= 75 ? t("weather.intelligence.insightHints.diseaseRisk") : t("weather.intelligence.insightHints.comfortable") },
    { label: t("weather.intelligence.insightLabels.wind"), value: `${Math.round(weather.wind_speed || 0)} ${t("weather.intelligence.units.kmh")}`, hint: (weather.wind_speed || 0) >= 30 ? t("weather.intelligence.insightHints.avoidSpraying") : t("weather.intelligence.insightHints.fieldWorkPossible") },
    { label: t("weather.intelligence.insightLabels.uv"), value: `${Math.round(weather.uv_index || 0)}`, hint: (weather.uv_index || 0) >= 8 ? t("weather.intelligence.insightHints.highPlantStress") : t("weather.intelligence.insightHints.normalSunlightRisk") },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">{t("weather.intelligence.fieldIntelligence")}</p>
      <div className="mt-3 rounded-2xl border border-primary/10 bg-primary/5 p-3">
        <p className="text-sm font-black text-primary">{t("weather.intelligence.aiLabel")}</p>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-foreground">{farmerInsight}</p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {insights.map((item) => (
          <div key={item.label} className="rounded-xl bg-muted/60 p-3">
            <p className="text-xs font-bold text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-base font-black text-foreground">{item.value}</p>
            <p className="mt-1 text-[11px] font-semibold leading-snug text-muted-foreground">{item.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WeatherInsights;
