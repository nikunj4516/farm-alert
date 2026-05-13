import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const QuickActions = () => {
  const { t } = useLanguage();

  const actions = [
    { icon: <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Tractor.png" alt="tractor" className="w-8 h-8 drop-shadow-sm" />, label: t("action_crop_tips"), color: "bg-primary/10 text-primary" },
    { icon: <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Droplet.png" alt="droplet" className="w-8 h-8 drop-shadow-sm" />, label: t("action_irrigation"), color: "bg-blue-50 text-blue-700" },
    { icon: <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Bug.png" alt="bug" className="w-8 h-8 drop-shadow-sm" />, label: t("action_pest_alert"), color: "bg-red-50 text-red-700" },
    { icon: <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shopping%20Cart.png" alt="shopping cart" className="w-8 h-8 drop-shadow-sm" />, label: t("action_buy_products"), color: "bg-accent/10 text-accent" },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">
        {t("quick_actions_title")}
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.93 }}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border shadow-card touch-manipulation hover:shadow-soft transition-shadow"
          >
            <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
              {action.icon}
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
