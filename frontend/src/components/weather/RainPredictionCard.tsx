import type { WeatherReport } from "@/services/weatherService";

interface RainPredictionCardProps {
  weather: WeatherReport;
}

const RainPredictionCard = ({ weather }: RainPredictionCardProps) => {
  const nextRainChance = Math.max(
    Number(weather.precipitation_probability || 0),
    ...weather.hourlyForecast.slice(0, 12).map((hour) => Number(hour.precipitationProbability || 0))
  );
  const rainWindow = weather.hourlyForecast.find((hour) => Number(hour.precipitationProbability || 0) >= 55);

  return (
    <section className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-950 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide opacity-75">Rain Prediction</p>
          <h2 className="mt-1 text-lg font-black">{Math.round(nextRainChance)}% chance</h2>
        </div>
        <span className="text-4xl leading-none" aria-hidden="true">🌧️</span>
      </div>
      <p className="mt-3 text-sm font-semibold leading-relaxed">
        {rainWindow
          ? `Rain risk increases around ${new Date(rainWindow.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Avoid spraying near this window.`
          : "No strong rain window detected in the next 12 hours. Keep monitoring before pesticide or fertilizer work."}
      </p>
    </section>
  );
};

export default RainPredictionCard;
