const WeatherSkeleton = () => (
  <div className="space-y-4">
    <div className="h-44 rounded-2xl bg-muted animate-pulse" />
    <div className="grid grid-cols-3 gap-3">
      <div className="h-20 rounded-2xl bg-muted animate-pulse" />
      <div className="h-20 rounded-2xl bg-muted animate-pulse" />
      <div className="h-20 rounded-2xl bg-muted animate-pulse" />
    </div>
    <div className="h-28 rounded-2xl bg-muted animate-pulse" />
  </div>
);

export default WeatherSkeleton;
