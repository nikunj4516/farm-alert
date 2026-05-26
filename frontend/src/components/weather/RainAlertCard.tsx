import { AgricultureWeatherAlert } from "@/services/weatherService";
import { useLanguage } from "@/contexts/LanguageContext";

interface RainAlertCardProps {
  alerts: AgricultureWeatherAlert[];
}

const severityClass = {
  green: "border-green-200 bg-green-50 text-green-800",
  yellow: "border-yellow-200 bg-yellow-50 text-yellow-800",
  orange: "border-orange-200 bg-orange-50 text-orange-800",
  red: "border-red-200 bg-red-50 text-red-800",
};

const RainAlertCard = ({ alerts }: RainAlertCardProps) => {
  const { t } = useLanguage();

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{t("home.smartWeatherAlerts")}</h2>
      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <div key={`${alert.type}-${index}`} className={`rounded-2xl border p-4 ${severityClass[alert.severity]}`}>
            <div className="flex gap-3">
              <span className="text-2xl leading-none" aria-hidden="true">
                {alert.severity === "red" ? "🚨" : alert.severity === "orange" ? "⚠️" : alert.severity === "yellow" ? "🌦️" : "✅"}
              </span>
              <div>
                <p className="text-sm font-black">{t(`weather.alerts.${alert.type}.message`)}</p>
                <p className="mt-1 text-xs font-semibold opacity-85">{t(`weather.alerts.${alert.type}.recommendation`)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RainAlertCard;
