import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const QuickActions = () => {
  const { t } = useLanguage();

  const actions = [
    { emoji: "🚜", label: t("action_crop_tips"), color: "bg-primary/10 text-primary" },
    { emoji: "💧", label: t("action_irrigation"), color: "bg-blue-50 text-blue-700" },
    { emoji: "🐛", label: t("action_pest_alert"), color: "bg-red-50 text-red-700" },
    { emoji: "🛒", label: t("action_buy_products"), color: "bg-accent/10 text-accent" },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-farmer-base font-bold text-foreground">
        {t("quick_actions_title")}
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.93 }}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border shadow-card touch-manipulation hover:shadow-soft transition-shadow"
          >
            <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center text-2xl`}>
              {action.emoji}
            </div>
            <span className="text-xs font-semibold text-foreground text-center leading-tight">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
