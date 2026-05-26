import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Database } from "@/types/database.types";

interface FarmingTipsProps {
  tipsData?: Database["public"]["Tables"]["farming_tips"]["Row"][];
}

const categoryIcon = (category?: string | null) => {
  const normalized = category?.toLowerCase() || "";
  if (normalized.includes("water") || normalized.includes("irrigation")) return "💧";
  if (normalized.includes("pest") || normalized.includes("disease")) return "🐛";
  if (normalized.includes("harvest")) return "🌾";
  if (normalized.includes("fertilizer") || normalized.includes("soil")) return "🌱";
  if (normalized.includes("seed") || normalized.includes("sowing")) return "🌰";
  return "🌿";
};

const categoryBg = (category?: string | null) => {
  const normalized = category?.toLowerCase() || "";
  if (normalized.includes("water") || normalized.includes("irrigation")) return "bg-blue-50";
  if (normalized.includes("pest") || normalized.includes("disease")) return "bg-red-50";
  if (normalized.includes("harvest")) return "bg-amber-50";
  if (normalized.includes("fertilizer") || normalized.includes("soil")) return "bg-green-50";
  return "bg-emerald-50";
};

const categoryKey = (category?: string | null) => {
  const normalized = category?.toLowerCase() || "general";
  if (normalized.includes("water")) return "water";
  if (normalized.includes("irrigation")) return "irrigation";
  if (normalized.includes("pest")) return "pest";
  if (normalized.includes("disease")) return "disease";
  if (normalized.includes("harvest")) return "harvest";
  if (normalized.includes("fertilizer")) return "fertilizer";
  if (normalized.includes("soil")) return "soil";
  if (normalized.includes("seed")) return "seed";
  if (normalized.includes("sowing")) return "sowing";
  return "general";
};

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
        icon: categoryIcon(tip.category),
        title: tip.title,
        description: tip.content || tip.description,
        category: tip.category,
        source: tip.source,
        bg: categoryBg(tip.category)
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
              {"category" in tip && (
                <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                  {t(`tips.category.${categoryKey(tip.category)}`)}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FarmingTips;
