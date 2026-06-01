import { WeatherReport } from "@/services/weatherService";
import CropRiskCard from "./CropRiskCard";
import EmergencyWarningCard from "./EmergencyWarningCard";
import EmergencyVoiceAlert from "@/components/voice/EmergencyVoiceAlert";
import FarmingRecommendations from "./FarmingRecommendations";
import ForecastCard from "./ForecastCard";
import HeatwaveAlertCard from "./HeatwaveAlertCard";
import RainPredictionCard from "./RainPredictionCard";
import SmartWeatherAlerts from "./SmartWeatherAlerts";
import WeatherCard from "./WeatherCard";
import WeatherInsights from "./WeatherInsights";
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
      <EmergencyVoiceAlert weather={weather} />
      <EmergencyWarningCard weather={weather} cropType={cropType} />
      <WeatherCard weather={weather} />
      <SmartWeatherAlerts alerts={weather.agricultureAlerts} cropType={cropType} />
      <CropRiskCard cropType={cropType} alerts={weather.agricultureAlerts} riskProfile={weather.cropRiskProfile} />
      <div className="grid gap-4 sm:grid-cols-2">
        <RainPredictionCard weather={weather} />
        <HeatwaveAlertCard weather={weather} cropType={cropType} />
      </div>
      <WeatherInsights weather={weather} cropType={cropType} />
      <FarmingRecommendations alerts={weather.agricultureAlerts} cropType={cropType} recommendations={weather.recommendations} />
      <ForecastCard weather={weather} />
    </div>
  );
};

export default FarmerWeatherDashboard;
