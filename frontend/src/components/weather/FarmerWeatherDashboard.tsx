import { WeatherReport } from "@/services/weatherService";
import CropWeatherInsights from "./CropWeatherInsights";
import ForecastCard from "./ForecastCard";
import RainAlertCard from "./RainAlertCard";
import WeatherCard from "./WeatherCard";
import WeatherSkeleton from "./WeatherSkeleton";
import { useLanguage } from "@/contexts/LanguageContext";

interface FarmerWeatherDashboardProps {
  weather?: WeatherReport | null;
  cropType?: string | null;
  isLoading?: boolean;
}

const FarmerWeatherDashboard = ({ weather, cropType, isLoading }: FarmerWeatherDashboardProps) => {
  const { t } = useLanguage();

  if (isLoading) return <WeatherSkeleton />;

  if (!weather) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-center">
        <p className="text-base font-bold text-foreground">{t("home.weatherLoadingTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("home.weatherLoadingBody")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <WeatherCard weather={weather} />
      <RainAlertCard alerts={weather.agricultureAlerts} />
      <CropWeatherInsights weather={weather} cropType={cropType} />
      <ForecastCard weather={weather} />
    </div>
  );
};

export default FarmerWeatherDashboard;
