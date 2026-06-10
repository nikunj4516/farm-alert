import { WeatherReport } from "@/services/weatherService";
import { useLanguage } from "@/contexts/LanguageContext";

interface ForecastCardProps {
  weather: WeatherReport;
}

const ForecastCard = ({ weather }: ForecastCardProps) => {
  const { language, t } = useLanguage();
  const hourly = weather.hourlyForecast.slice(0, 8);
  const locale = language === "hi" ? "hi-IN" : language === "gu" ? "gu-IN" : "en-IN";
  const graphCopy = {
    en: { temp: "Temperature graph", rain: "Rain graph", humidity: "Humidity graph", wind: "Wind graph" },
    hi: { temp: "तापमान ग्राफ", rain: "बारिश ग्राफ", humidity: "नमी ग्राफ", wind: "हवा ग्राफ" },
    gu: { temp: "તાપમાન ગ્રાફ", rain: "વરસાદ ગ્રાફ", humidity: "ભેજ ગ્રાફ", wind: "પવન ગ્રાફ" },
  }[language as "en" | "gu" | "hi"] || { temp: "Temperature graph", rain: "Rain graph", humidity: "Humidity graph", wind: "Wind graph" };
  const graphMetrics = [
    { label: graphCopy.temp, color: "bg-orange-500", values: hourly.map((hour) => hour.temperature ?? 0), suffix: "°" },
    { label: graphCopy.rain, color: "bg-blue-500", values: hourly.map((hour) => hour.precipitationProbability ?? 0), suffix: "%" },
    { label: graphCopy.humidity, color: "bg-emerald-500", values: hourly.map((hour) => hour.humidity ?? 0), suffix: "%" },
    { label: graphCopy.wind, color: "bg-sky-500", values: hourly.map((hour) => hour.windSpeed ?? 0), suffix: ` ${t("weather.intelligence.units.kmh")}` },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{t("home.hourlyForecast")}</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {hourly.map((hour) => (
          <div key={hour.time} className="min-w-[72px] rounded-2xl border border-border bg-card p-3 text-center shadow-card">
            <p className="text-xs font-bold text-muted-foreground">
              {new Intl.DateTimeFormat(locale, { hour: "numeric" }).format(new Date(hour.time))}
            </p>
            <div className="my-2 text-2xl leading-none" aria-hidden="true">{hour.icon}</div>
            <p className="text-sm font-black">{Math.round(hour.temperature ?? 0)}°</p>
            <p className="mt-1 text-[11px] font-semibold text-blue-600">{Math.round(hour.precipitationProbability ?? 0)}%</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {graphMetrics.map((metric) => {
          const maxValue = Math.max(...metric.values, 1);
          return (
            <div key={metric.label} className="rounded-2xl border border-border bg-card p-3 shadow-card">
              <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">{metric.label}</p>
              <div className="mt-3 flex h-20 items-end gap-1.5">
                {metric.values.map((value, index) => (
                  <div key={`${metric.label}-${index}`} className="flex flex-1 flex-col items-center gap-1">
                    <div className={`w-full rounded-t-lg ${metric.color}`} style={{ height: `${Math.max(8, (value / maxValue) * 64)}px` }} />
                    <span className="text-[9px] font-bold text-muted-foreground">{Math.round(value)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs font-bold text-foreground">
                {Math.round(metric.values[0] || 0)}{metric.suffix}
              </p>
            </div>
          );
        })}
      </div>

      <h2 className="text-lg font-semibold text-foreground">{t("home.sevenDayForecast")}</h2>
      <div className="space-y-2">
        {weather.forecast.slice(0, 7).map((day) => (
          <div key={day.date} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
            <div className="flex items-center gap-3">
              <span className="text-2xl leading-none" aria-hidden="true">{day.icon}</span>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric" }).format(new Date(day.date))}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {day.weatherCondition ? t(`weather.conditions.${day.weatherCondition}`) : t("home.weatherUpdate")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black">{Math.round(day.maxTemperature ?? 0)}° / {Math.round(day.minTemperature ?? 0)}°</p>
              <p className="text-xs font-bold text-blue-600">{t("home.rain")} {Math.round(day.precipitationProbability ?? 0)}%</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ForecastCard;
