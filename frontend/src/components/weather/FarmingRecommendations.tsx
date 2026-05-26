import type { SmartAgricultureAlert } from "@/services/agricultureWeatherRules";
import { getCropWeatherThreshold } from "@/services/agricultureWeatherRules";
import { useLanguage } from "@/contexts/LanguageContext";

interface FarmingRecommendationsProps {
  alerts: SmartAgricultureAlert[];
  cropType?: string | null;
}

const FarmingRecommendations = ({ alerts, cropType }: FarmingRecommendationsProps) => {
  const { t } = useLanguage();
  const crop = t(`weather.intelligence.crops.${getCropWeatherThreshold(cropType).cropName}`);
  const recommendations = alerts
    .filter((alert) => alert.type !== "safe_weather")
    .map((alert) => t(`weather.intelligence.alerts.${alert.type}.recommendation`).replace("{crop}", crop).replace("{value}", alert.metricValue))
    .slice(0, 3);

  const safeRecommendations = [
    t("weather.intelligence.safeAction1"),
    t("weather.intelligence.safeAction2"),
    t("weather.intelligence.safeAction3"),
  ];

  return (
    <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-primary">{t("weather.intelligence.recommendedActions")}</p>
      <div className="mt-3 space-y-2">
        {(recommendations.length ? recommendations : safeRecommendations).map((item, index) => (
          <div key={`${item}-${index}`} className="flex gap-3 rounded-xl bg-white/75 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
              {index + 1}
            </span>
            <p className="text-sm font-bold leading-relaxed text-foreground">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FarmingRecommendations;
