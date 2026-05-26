import type { SmartAgricultureAlert } from "@/services/agricultureWeatherRules";

interface FarmingRecommendationsProps {
  alerts: SmartAgricultureAlert[];
}

const FarmingRecommendations = ({ alerts }: FarmingRecommendationsProps) => {
  const recommendations = alerts
    .filter((alert) => alert.type !== "safe_weather")
    .map((alert) => alert.recommendation)
    .slice(0, 3);

  const safeRecommendations = [
    "Continue normal field monitoring.",
    "Check soil moisture before irrigation.",
    "Review crop-stage farming tips for the next operation.",
  ];

  return (
    <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-primary">Recommended Actions</p>
      <div className="mt-3 space-y-2">
        {(recommendations.length ? recommendations : safeRecommendations).map((item, index) => (
          <div key={`${item}-${index}`} className="flex gap-3 rounded-xl bg-white/75 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
              {index + 1}
            </span>
            <p className="text-sm font-bold leading-relaxed text-foreground">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FarmingRecommendations;
