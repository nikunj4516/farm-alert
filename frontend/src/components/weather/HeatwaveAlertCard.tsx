import type { WeatherReport } from "@/services/weatherService";

interface HeatwaveAlertCardProps {
  weather: WeatherReport;
  cropType?: string | null;
}

const HeatwaveAlertCard = ({ weather, cropType }: HeatwaveAlertCardProps) => {
  const maxTemp = Math.max(Number(weather.temperature || 0), ...weather.forecast.slice(0, 3).map((day) => Number(day.maxTemperature || 0)));
  const isHeatRisk = maxTemp >= 38;

  return (
    <section className={`rounded-2xl border p-4 shadow-sm ${isHeatRisk ? "border-red-200 bg-red-50 text-red-950" : "border-green-200 bg-green-50 text-green-900"}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide opacity-75">Heatwave Watch</p>
          <h2 className="mt-1 text-lg font-black">{Math.round(maxTemp)}°C max</h2>
        </div>
        <span className="text-4xl leading-none" aria-hidden="true">{isHeatRisk ? "🔥" : "🌿"}</span>
      </div>
      <p className="mt-3 text-sm font-semibold leading-relaxed">
        {isHeatRisk
          ? `${cropType || "Crop"} may lose moisture faster. Prefer evening irrigation and avoid afternoon spraying.`
          : "Heat stress risk is low right now. Continue normal irrigation planning."}
      </p>
    </section>
  );
};

export default HeatwaveAlertCard;
