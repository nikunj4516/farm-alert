import { WeatherReport } from "@/services/weatherService";
import { useLanguage } from "@/contexts/LanguageContext";

interface CropWeatherInsightsProps {
  weather: WeatherReport;
  cropType?: string | null;
}

const CropWeatherInsights = ({ weather, cropType }: CropWeatherInsightsProps) => {
  const { language, t } = useLanguage();
  const rain = Math.round(weather.precipitation_probability ?? 0);
  const humidity = Math.round(weather.humidity ?? 0);
  const temp = Math.round(weather.temperature ?? 0);

  const insights = [
    rain >= 60 ? t("weather.insights.avoidSpray") : t("weather.insights.sprayOk"),
    humidity >= 75 ? t("weather.insights.humidityHigh") : t("weather.insights.humidityOk"),
    temp >= 38 ? t("weather.insights.heatHigh") : t("weather.insights.heatOk"),
  ];
  const cropLabels = {
    Cotton: { en: "Cotton", hi: "कपास", gu: "કપાસ" },
    Wheat: { en: "Wheat", hi: "गेहूँ", gu: "ઘઉં" },
    Rice: { en: "Rice", hi: "धान", gu: "ડાંગર" },
    Groundnut: { en: "Groundnut", hi: "मूँगफली", gu: "મગફળી" },
    Sugarcane: { en: "Sugarcane", hi: "गन्ना", gu: "શેરડી" },
    Vegetables: { en: "Vegetables", hi: "सब्ज़ी", gu: "શાકભાજી" },
  };
  const cropLabel = cropLabels[cropType as keyof typeof cropLabels]?.[language] || cropType || t("home.farm");

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <p className="text-xs font-bold uppercase text-primary">{t("home.cropWeatherIntelligence")}</p>
      <h2 className="mt-1 text-lg font-black text-foreground">
        {cropLabel} {t("home.recommendations")}
      </h2>
      <div className="mt-3 space-y-2">
        {insights.map((insight) => (
          <div key={insight} className="flex items-start gap-2 text-sm font-medium text-muted-foreground">
            <span className="text-base leading-none" aria-hidden="true">🌿</span>
            <span>{insight}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CropWeatherInsights;
