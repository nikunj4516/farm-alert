import type { WeatherReport } from "@/services/weatherService";
import { getCropWeatherThreshold } from "@/services/agricultureWeatherRules";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeatwaveAlertCardProps {
  weather: WeatherReport;
  cropType?: string | null;
}

const HeatwaveAlertCard = ({ weather, cropType }: HeatwaveAlertCardProps) => {
  const { t } = useLanguage();
  const maxTemp = Math.max(Number(weather.temperature || 0), ...weather.forecast.slice(0, 3).map((day) => Number(day.maxTemperature || 0)));
  const isHeatRisk = maxTemp >= 38;
  const crop = t(`weather.intelligence.crops.${getCropWeatherThreshold(cropType).cropName}`);

  return (
    <section className={`rounded-2xl border p-4 shadow-sm ${isHeatRisk ? "border-red-200 bg-red-50 text-red-950" : "border-green-200 bg-green-50 text-green-900"}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide opacity-75">{t("weather.intelligence.heatwaveWatch")}</p>
          <h2 className="mt-1 text-lg font-black">{Math.round(maxTemp)}°C {t("weather.intelligence.max")}</h2>
        </div>
        <span className="text-4xl leading-none" aria-hidden="true">{isHeatRisk ? "🔥" : "🌿"}</span>
      </div>
      <p className="mt-3 text-sm font-semibold leading-relaxed">
        {isHeatRisk
          ? t("weather.intelligence.heatRisk").replace("{crop}", crop)
          : t("weather.intelligence.heatSafe")}
      </p>
    </section>
  );
};

export default HeatwaveAlertCard;
