import type { SmartAgricultureAlert } from "@/services/agricultureWeatherRules";
import { getCropWeatherThreshold } from "@/services/agricultureWeatherRules";
import { useLanguage } from "@/contexts/LanguageContext";

interface SmartWeatherAlertsProps {
  alerts: SmartAgricultureAlert[];
  cropType?: string | null;
}

const alertTheme: Record<SmartAgricultureAlert["color"], string> = {
  green: "border-green-200 bg-green-50 text-green-900",
  yellow: "border-yellow-200 bg-yellow-50 text-yellow-900",
  orange: "border-orange-200 bg-orange-50 text-orange-950",
  red: "border-red-200 bg-red-50 text-red-950",
  blue: "border-sky-200 bg-sky-50 text-sky-950",
};

const alertIcon = (alert: SmartAgricultureAlert) => {
  if (alert.type === "heatwave") return "🔥";
  if (alert.type === "heavy_rain" || alert.type === "rain") return "🌧️";
  if (alert.type === "strong_wind") return "🌬️";
  if (alert.type === "pest_risk" || alert.type === "disease_risk" || alert.type === "humidity") return "🛡️";
  if (alert.type === "frost") return "❄️";
  if (alert.type === "uv_stress") return "☀️";
  if (alert.type === "safe_weather") return "✅";
  return "⚠️";
};

const formatTemplate = (template: string, values: Record<string, string>) =>
  Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);

const SmartWeatherAlerts = ({ alerts, cropType }: SmartWeatherAlertsProps) => {
  const { t } = useLanguage();
  const primaryAlerts = alerts.slice(0, 3);
  const threshold = getCropWeatherThreshold(cropType);
  const crop = t(`weather.intelligence.crops.${threshold.cropName}`);

  const alertTitle = (alert: SmartAgricultureAlert) => t(`weather.intelligence.alerts.${alert.type}.title`);
  const alertMessage = (alert: SmartAgricultureAlert) =>
    formatTemplate(t(`weather.intelligence.alerts.${alert.type}.message`), {
      crop,
      value: metricValue(alert),
    });
  const alertRecommendation = (alert: SmartAgricultureAlert) => t(`weather.intelligence.alerts.${alert.type}.recommendation`);
  const metricValue = (alert: SmartAgricultureAlert) => {
    if (alert.metricLabel === "Wind") return alert.metricValue.replace("km/h", t("weather.intelligence.units.kmh"));
    if (alert.metricLabel === "Status" && alert.metricValue === "Safe") return t("weather.intelligence.safeStatus");
    return alert.metricValue;
  };

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-primary">{t("weather.intelligence.aiLabel")}</p>
        <h2 className="text-lg font-black text-foreground">{t("weather.intelligence.smartCropAlerts")}</h2>
      </div>

      <div className="space-y-3">
        {primaryAlerts.map((alert) => (
          <article key={`${alert.type}-${alert.metricValue}`} className={`rounded-2xl border p-4 shadow-sm ${alertTheme[alert.color]}`}>
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/75 text-2xl leading-none shadow-sm" aria-hidden="true">
                {alertIcon(alert)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-black uppercase">
                    {t(`weather.intelligence.severity.${alert.severity}`)}
                  </span>
                  <span className="rounded-full bg-white/65 px-2.5 py-1 text-[11px] font-bold">
                    {t(`weather.intelligence.metrics.${alert.metricLabel}`)}: {metricValue(alert)}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-black leading-snug">{alertTitle(alert)}</h3>
                <p className="mt-1 text-sm font-semibold leading-relaxed opacity-90">{alertMessage(alert)}</p>
                <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-bold leading-relaxed">
                  {alertRecommendation(alert)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default SmartWeatherAlerts;
