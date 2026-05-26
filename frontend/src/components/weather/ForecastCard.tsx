import { WeatherReport } from "@/services/weatherService";
import { useLanguage } from "@/contexts/LanguageContext";

interface ForecastCardProps {
  weather: WeatherReport;
}

const ForecastCard = ({ weather }: ForecastCardProps) => {
  const { language, t } = useLanguage();
  const hourly = weather.hourlyForecast.slice(0, 8);
  const locale = language === "hi" ? "hi-IN" : language === "gu" ? "gu-IN" : "en-IN";

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
