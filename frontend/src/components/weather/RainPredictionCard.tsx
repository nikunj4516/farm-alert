import type { WeatherReport } from "@/services/weatherService";
import { useLanguage } from "@/contexts/LanguageContext";

interface RainPredictionCardProps {
  weather: WeatherReport;
}

const RainPredictionCard = ({ weather }: RainPredictionCardProps) => {
  const { language, t } = useLanguage();
  const nextRainChance = Math.max(
    Number(weather.precipitation_probability || 0),
    ...weather.hourlyForecast.slice(0, 12).map((hour) => Number(hour.precipitationProbability || 0))
  );
  const rainWindow = weather.hourlyForecast.find((hour) => Number(hour.precipitationProbability || 0) >= 55);

  const rainTime = rainWindow
    ? new Date(rainWindow.time).toLocaleTimeString(language === "gu" ? "gu-IN" : language === "hi" ? "hi-IN" : "en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <section className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-950 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide opacity-75">{t("weather.intelligence.rainPrediction")}</p>
          <h2 className="mt-1 text-lg font-black">{Math.round(nextRainChance)}% {t("weather.intelligence.chance")}</h2>
        </div>
        <span className="text-4xl leading-none" aria-hidden="true">🌧️</span>
      </div>
      <p className="mt-3 text-sm font-semibold leading-relaxed">
        {rainWindow
          ? t("weather.intelligence.rainWindow").replace("{time}", rainTime)
          : t("weather.intelligence.noRainWindow")}
      </p>
    </section>
  );
};

export default RainPredictionCard;
