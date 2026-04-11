import { Sprout, Droplets, Bug, Wheat } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FarmingTips = () => {
  const { t } = useLanguage();

  const tips = [
    {
      icon: <Droplets className="w-8 h-8 text-primary-foreground" />,
      title: t("tip_water_title"),
      description: t("tip_water_desc"),
    },
    {
      icon: <Bug className="w-8 h-8 text-primary-foreground" />,
      title: t("tip_pest_title"),
      description: t("tip_pest_desc"),
    },
    {
      icon: <Wheat className="w-8 h-8 text-primary-foreground" />,
      title: t("tip_harvest_title"),
      description: t("tip_harvest_desc"),
    },
    {
      icon: <Sprout className="w-8 h-8 text-primary-foreground" />,
      title: t("tip_fertilizer_title"),
      description: t("tip_fertilizer_desc"),
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-farmer-lg font-bold text-foreground">{t("tips_title")}</h2>
      <div className="grid grid-cols-2 gap-3">
        {tips.map((tip, index) => (
          <button
            key={index}
            className="flex flex-col items-start bg-primary text-primary-foreground rounded-lg p-4 min-h-[120px] active:scale-95 transition-transform touch-manipulation"
          >
            <div className="mb-2">{tip.icon}</div>
            <span className="text-farmer-sm font-bold text-left">{tip.title}</span>
            <span className="text-sm text-primary-foreground/80 text-left mt-1">{tip.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FarmingTips;
