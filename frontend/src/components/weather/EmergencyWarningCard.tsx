import type { WeatherReport } from "@/services/weatherService";
import { getCropWeatherThreshold } from "@/services/agricultureWeatherRules";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmergencyWarningCardProps {
  weather: WeatherReport;
  cropType?: string | null;
}

const statusTheme = {
  GREEN: "border-green-200 bg-green-50 text-green-950",
  YELLOW: "border-amber-200 bg-amber-50 text-amber-950",
  RED: "border-red-300 bg-red-50 text-red-950 shadow-elevated",
};

const EmergencyWarningCard = ({ weather, cropType }: EmergencyWarningCardProps) => {
  const { t } = useLanguage();
  const danger = weather.dangerAssessment;
  const crop = t(`weather.intelligence.crops.${getCropWeatherThreshold(cropType).cropName}`);
  const status = t(`weather.danger.status.${danger.status}`);

  return (
    <section className={`rounded-2xl border-2 p-4 ${statusTheme[danger.status]}`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl leading-none ${danger.status === "RED" ? "animate-pulse" : ""}`} aria-hidden="true">
          {danger.status === "RED" ? "🚨" : danger.status === "YELLOW" ? "⚠️" : "✅"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase">
              {status}
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black">
              {t("weather.danger.score")}: {danger.dangerScore}
            </span>
          </div>
          <h2 className="mt-2 text-lg font-black leading-tight">
            {t(`weather.danger.title.${danger.status}`)}
          </h2>
          <p className="mt-1 text-sm font-bold leading-relaxed">
            {t(`weather.danger.message.${danger.message}`).replace("{crop}", crop)}
          </p>
          {danger.status === "RED" && (
            <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-sm font-black leading-relaxed">
              {t("weather.danger.openApp")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default EmergencyWarningCard;
