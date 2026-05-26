import type { WeatherReport } from "@/services/weatherService";

interface WeatherInsightsProps {
  weather: WeatherReport;
}

const WeatherInsights = ({ weather }: WeatherInsightsProps) => {
  const insights = [
    { label: "Humidity", value: `${Math.round(weather.humidity || 0)}%`, hint: (weather.humidity || 0) >= 75 ? "Disease risk can rise" : "Comfortable range" },
    { label: "Wind", value: `${Math.round(weather.wind_speed || 0)} km/h`, hint: (weather.wind_speed || 0) >= 30 ? "Avoid spraying" : "Field work possible" },
    { label: "UV", value: `${Math.round(weather.uv_index || 0)}`, hint: (weather.uv_index || 0) >= 8 ? "High plant stress" : "Normal sunlight risk" },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Field Intelligence</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {insights.map((item) => (
          <div key={item.label} className="rounded-xl bg-muted/60 p-3">
            <p className="text-xs font-bold text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-base font-black text-foreground">{item.value}</p>
            <p className="mt-1 text-[11px] font-semibold leading-snug text-muted-foreground">{item.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WeatherInsights;
