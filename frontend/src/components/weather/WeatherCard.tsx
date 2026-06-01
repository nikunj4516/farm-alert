import { WeatherReport } from "@/services/weatherService";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocationLabel } from "@/services/gujaratLocationService";

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

const weatherCopy = {
  en: {
    updated: "Updated",
    cached: "Cached",
    stale: "Last available",
    minMax: "Min / Max",
    pressure: "Pressure",
    visibility: "Visibility",
    clouds: "Clouds",
    uv: "UV Index",
    dewPoint: "Dew point",
    windDirection: "Wind dir",
    sunrise: "Sunrise",
    sunset: "Sunset",
    aqi: "AQI",
    noData: "Not available",
  },
  hi: {
    updated: "अपडेट",
    cached: "कैश",
    stale: "अंतिम उपलब्ध",
    minMax: "न्यूनतम / अधिकतम",
    pressure: "दबाव",
    visibility: "दृश्यता",
    clouds: "बादल",
    uv: "यूवी सूचकांक",
    dewPoint: "ओसांक",
    windDirection: "हवा दिशा",
    sunrise: "सूर्योदय",
    sunset: "सूर्यास्त",
    aqi: "AQI",
    noData: "उपलब्ध नहीं",
  },
  gu: {
    updated: "અપડેટ",
    cached: "કૅશ",
    stale: "છેલ્લી ઉપલબ્ધ",
    minMax: "ન્યૂનતમ / મહત્તમ",
    pressure: "દબાણ",
    visibility: "દૃશ્યતા",
    clouds: "વાદળ",
    uv: "યુવી સૂચકાંક",
    dewPoint: "ડ્યુ પોઇન્ટ",
    windDirection: "પવન દિશા",
    sunrise: "સૂર્યોદય",
    sunset: "સૂર્યાસ્ત",
    aqi: "AQI",
    noData: "ઉપલબ્ધ નથી",
  },
} as const;

const formatTime = (value: string | null | undefined, locale: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date);
};

const WeatherCard = ({ weather }: WeatherCardProps) => {
  const { language, t } = useLanguage();
  const copy = weatherCopy[language];
  const locale = language === "hi" ? "hi-IN" : language === "gu" ? "gu-IN" : "en-IN";
  const condition = weather.weather_condition;
  const conditionLabel = condition ? t(`weather.conditions.${condition}`) : t("home.weatherUpdate");
  const providerLabel = t(`weather.intelligence.providers.${weather.provider || "weather"}`);
  const locationLabel = (weather.location || weather.district || "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && part.toLowerCase() !== "india")
    .map((part) => getLocationLabel(part, language))
    .filter(Boolean)
    .join(", ");
  const minMax = weather.forecast[0]
    ? `${Math.round(weather.forecast[0].minTemperature ?? 0)}° / ${Math.round(weather.forecast[0].maxTemperature ?? 0)}°`
    : copy.noData;
  const updatedAt = weather.fetched_at ? new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(new Date(weather.fetched_at)) : "";
  const advancedMetrics = [
    { icon: "🌡️", label: copy.minMax, value: minMax },
    { icon: "🧭", label: copy.windDirection, value: weather.wind_direction !== null ? `${Math.round(weather.wind_direction)}°` : copy.noData },
    { icon: "🧱", label: copy.pressure, value: weather.pressure !== null ? `${Math.round(weather.pressure)} hPa` : copy.noData },
    { icon: "👁️", label: copy.visibility, value: weather.visibility !== null ? `${Math.round((weather.visibility || 0) / 1000)} km` : copy.noData },
    { icon: "☁️", label: copy.clouds, value: weather.cloud_coverage !== null ? `${Math.round(weather.cloud_coverage || 0)}%` : copy.noData },
    { icon: "🔆", label: copy.uv, value: weather.uv_index !== null ? `${Math.round(weather.uv_index || 0)}` : copy.noData },
    { icon: "💦", label: copy.dewPoint, value: weather.dew_point !== null ? `${Math.round(weather.dew_point)}°C` : copy.noData },
    { icon: "🌅", label: copy.sunrise, value: formatTime(weather.sunrise, locale) || copy.noData },
    { icon: "🌇", label: copy.sunset, value: formatTime(weather.sunset, locale) || copy.noData },
  ];

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
        📍 {locationLabel}
      </p>
      <p className="mt-1 text-xs font-bold text-primary-foreground/65">
        {weather.isStale ? copy.stale : weather.isCached ? copy.cached : copy.updated} {updatedAt}
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
      <div className="mt-3 grid grid-cols-3 gap-2">
        {advancedMetrics.map((item) => (
          <div key={item.label} className="rounded-xl bg-primary-foreground/10 p-2.5">
            <span className="text-lg leading-none" aria-hidden="true">{item.icon}</span>
            <p className="mt-1 text-[10px] font-bold text-primary-foreground/65">{item.label}</p>
            <p className="text-xs font-black">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WeatherCard;
