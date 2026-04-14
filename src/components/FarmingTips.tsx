import { Sprout, Droplets, Bug, Wheat } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const FarmingTips = () => {
  const { t } = useLanguage();

  const tips = [
    {
      icon: <Droplets className="w-7 h-7 text-blue-600" />,
      title: t("tip_water_title"),
      description: t("tip_water_desc"),
      bg: "bg-blue-50",
    },
    {
      icon: <Bug className="w-7 h-7 text-red-600" />,
      title: t("tip_pest_title"),
      description: t("tip_pest_desc"),
      bg: "bg-red-50",
    },
    {
      icon: <Wheat className="w-7 h-7 text-amber-600" />,
      title: t("tip_harvest_title"),
      description: t("tip_harvest_desc"),
      bg: "bg-amber-50",
    },
    {
      icon: <Sprout className="w-7 h-7 text-green-600" />,
      title: t("tip_fertilizer_title"),
      description: t("tip_fertilizer_desc"),
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-farmer-base font-bold text-foreground">{t("tips_title")}</h2>
      <div className="space-y-3">
        {tips.map((tip, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-start gap-4 bg-card border border-border rounded-2xl p-4 shadow-card text-left touch-manipulation hover:shadow-soft transition-shadow"
          >
            <div className={`w-12 h-12 rounded-xl ${tip.bg} flex items-center justify-center shrink-0`}>
              {tip.icon}
            </div>
            <div>
              <span className="text-farmer-sm font-bold text-foreground block">{tip.title}</span>
              <span className="text-sm text-muted-foreground mt-0.5 block leading-relaxed">{tip.description}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default FarmingTips;
