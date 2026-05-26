import { WeatherReport } from "@/services/weatherService";
import { useLanguage } from "@/contexts/LanguageContext";

interface WeatherCardProps {
  weather: WeatherReport;
}

const conditionIcon = (condition?: string | null) => {
  const normalized = condition?.toLowerCase() || "";
  if (normalized.includes("thunder") || normalized.includes("storm")) return "⛈️";
  if (normalized.includes("rain") || normalized.includes("drizzle")) return "🌧️";
  if (normalized.includes("cloud") || normalized.includes("overcast")) return "☁️";
  if (normalized.includes("fog") || normalized.includes("mist") || normalized.includes("haze")) return "🌫️";
  if (normalized.includes("clear") || normalized.includes("sun")) return "☀️";
  return "🌦️";
};

const WeatherCard = ({ weather }: WeatherCardProps) => {
  const { t } = useLanguage();
  const condition = weather.weather_condition;
  const conditionLabel = condition ? t(`weather.conditions.${condition}`) : t("home.weatherUpdate");
  const providerLabel = t(`weather.intelligence.providers.${weather.provider || "weather"}`);

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-emerald-700 p-5 text-primary-foreground shadow-elevated">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary-foreground/70">
            {providerLabel} {t("home.weatherIntelligence")}
          </p>
          <h2 className="mt-1 text-2xl font-black leading-tight">
            {Math.round(weather.temperature ?? 0)}°C
          </h2>
          <p className="mt-1 text-sm font-semibold text-primary-foreground/85">
            {t("home.feelsLike")} {Math.round(weather.feels_like ?? weather.temperature ?? 0)}°C
          </p>
        </div>
        <div className="text-right">
          <div className="text-5xl leading-none" aria-hidden="true">
            {conditionIcon(weather.weather_condition)}
          </div>
          <p className="mt-2 max-w-32 text-sm font-bold">{conditionLabel}</p>
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-primary-foreground/85">
        📍 {weather.location || weather.district}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { icon: "💧", label: t("home.humidity"), value: `${Math.round(weather.humidity ?? 0)}%` },
          { icon: "🌧️", label: t("home.rain"), value: `${Math.round(weather.precipitation_probability ?? 0)}%` },
          { icon: "🌬️", label: t("home.wind"), value: `${Math.round(weather.wind_speed ?? 0)} ${t("weather.intelligence.units.kmh")}` },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-primary-foreground/15 p-3 text-center">
            <span className="text-xl leading-none" aria-hidden="true">{item.icon}</span>
            <p className="mt-1 text-xs font-medium text-primary-foreground/70">{item.label}</p>
            <p className="text-sm font-black">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WeatherCard;
