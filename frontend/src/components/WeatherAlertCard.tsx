import { CloudRain, CloudSun, Sun, Droplets, Wind, Thermometer } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const alertKeys = {
  red: "alert_red",
  orange: "alert_orange",
  yellow: "alert_yellow",
  green: "alert_green",
} as const;

const alertBg = {
  red: "bg-alert-red",
  orange: "bg-alert-orange",
  yellow: "bg-alert-yellow",
  green: "bg-alert-green",
};

type AlertLevel = keyof typeof alertKeys;

interface WeatherAlertCardProps {
  level: AlertLevel;
  title: string;
  description: string;
  temperature: string;
  humidity: string;
  wind: string;
}

const WeatherAlertCard = ({ level, title, description, temperature, humidity, wind }: WeatherAlertCardProps) => {
  const { t } = useLanguage();
  const isUrgent = level === "red" || level === "orange";
  const WeatherIcon = level === "red" ? CloudRain : level === "orange" ? CloudSun : Sun;

  return (
    <div className={`rounded-2xl p-5 ${alertBg[level]} ${isUrgent ? "animate-pulse-alert" : ""} shadow-elevated`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-farmer-sm font-bold text-primary-foreground/90 bg-primary-foreground/15 px-3 py-1 rounded-full">
          {t(alertKeys[level])}
        </span>
        <div className="w-12 h-12 rounded-full bg-primary-foreground/15 flex items-center justify-center text-primary-foreground">
          {level === "red" ? <CloudRain className="w-6 h-6" /> : level === "orange" ? <CloudSun className="w-6 h-6" /> : level === "yellow" ? <CloudSun className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-primary-foreground mb-1">{title}</h2>
      <p className="text-farmer-sm text-primary-foreground/85 mb-4 leading-relaxed">{description}</p>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Thermometer className="w-5 h-5" />, value: temperature },
          { icon: <Droplets className="w-5 h-5" />, value: humidity },
          { icon: <Wind className="w-5 h-5" />, value: wind },
        ].map(({ icon, value }, i) => (
          <div key={i} className="flex flex-col items-center bg-primary-foreground/15 backdrop-blur-sm rounded-xl p-3 gap-1">
            <span className="text-primary-foreground">{icon}</span>
            <span className="text-sm font-bold text-primary-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherAlertCard;
