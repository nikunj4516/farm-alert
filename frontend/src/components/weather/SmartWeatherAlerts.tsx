import type { SmartAgricultureAlert } from "@/services/agricultureWeatherRules";

interface SmartWeatherAlertsProps {
  alerts: SmartAgricultureAlert[];
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

const SmartWeatherAlerts = ({ alerts }: SmartWeatherAlertsProps) => {
  const primaryAlerts = alerts.slice(0, 3);

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-primary">AI Weather Intelligence</p>
        <h2 className="text-lg font-black text-foreground">Smart Crop Alerts</h2>
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
                    {alert.severity}
                  </span>
                  <span className="rounded-full bg-white/65 px-2.5 py-1 text-[11px] font-bold">
                    {alert.metricLabel}: {alert.metricValue}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-black leading-snug">{alert.title}</h3>
                <p className="mt-1 text-sm font-semibold leading-relaxed opacity-90">{alert.message}</p>
                <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-bold leading-relaxed">
                  {alert.recommendation}
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
