import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Database } from "@/types/database.types";

interface FarmingTipsProps {
  tipsData?: Database["public"]["Tables"]["farming_tips"]["Row"][];
}

const FarmingTips = ({ tipsData }: FarmingTipsProps) => {
  const { t } = useLanguage();

  const defaultTips = [
    {
      icon: "💧",
      title: t("tip_water_title"),
      description: t("tip_water_desc"),
      bg: "bg-blue-50",
    },
    {
      icon: "🐛",
      title: t("tip_pest_title"),
      description: t("tip_pest_desc"),
      bg: "bg-red-50",
    },
    {
      icon: "🌾",
      title: t("tip_harvest_title"),
      description: t("tip_harvest_desc"),
      bg: "bg-amber-50",
    },
    {
      icon: "🌱",
      title: t("tip_fertilizer_title"),
      description: t("tip_fertilizer_desc"),
      bg: "bg-green-50",
    },
  ];

  const displayTips = tipsData && tipsData.length > 0 
    ? tipsData.map(tip => ({
        icon: "🌱",
        title: tip.title,
        description: tip.content || tip.description,
        bg: "bg-green-50"
      }))
    : defaultTips;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{t("tips_title")}</h2>
      <div className="space-y-3">
        {displayTips.map((tip, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full flex items-start gap-4 bg-card border border-border rounded-2xl p-4 shadow-sm text-left hover:shadow-md transition-all"
          >
            <div className={`w-12 h-12 rounded-xl ${tip.bg} flex items-center justify-center shrink-0`}>
              <span className="text-3xl leading-none" aria-hidden="true">{tip.icon}</span>
            </div>
            <div>
              <span className="text-base font-semibold text-foreground block">{tip.title}</span>
              <span className="text-sm text-muted-foreground mt-0.5 block leading-relaxed">{tip.description}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FarmingTips;
