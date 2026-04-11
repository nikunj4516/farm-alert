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
    <div className={`rounded-lg p-5 ${alertBg[level]} ${isUrgent ? "animate-pulse-alert" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-farmer-lg font-bold text-primary-foreground">
          {t(alertKeys[level])}
        </span>
        <WeatherIcon className="w-10 h-10 text-primary-foreground" />
      </div>

      <h2 className="text-farmer-xl font-extrabold text-primary-foreground mb-2">{title}</h2>
      <p className="text-farmer-base text-primary-foreground/90 mb-4">{description}</p>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center bg-primary-foreground/20 rounded-md p-3">
          <Thermometer className="w-6 h-6 text-primary-foreground mb-1" />
          <span className="text-farmer-sm font-bold text-primary-foreground">{temperature}</span>
        </div>
        <div className="flex flex-col items-center bg-primary-foreground/20 rounded-md p-3">
          <Droplets className="w-6 h-6 text-primary-foreground mb-1" />
          <span className="text-farmer-sm font-bold text-primary-foreground">{humidity}</span>
        </div>
        <div className="flex flex-col items-center bg-primary-foreground/20 rounded-md p-3">
          <Wind className="w-6 h-6 text-primary-foreground mb-1" />
          <span className="text-farmer-sm font-bold text-primary-foreground">{wind}</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherAlertCard;
