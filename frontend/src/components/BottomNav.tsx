import { useLanguage } from "@/contexts/LanguageContext";
import { CloudSun, Lightbulb, Newspaper, Building2, User } from "lucide-react";
import { motion } from "framer-motion";

type Tab = "weather" | "tips" | "news" | "about" | "profile";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const { t } = useLanguage();

  const tabs = [
    { id: "weather" as Tab, label: t("nav_weather"), icon: <CloudSun className="w-6 h-6" /> },
    { id: "tips" as Tab, label: t("nav_tips"), icon: <Lightbulb className="w-6 h-6" /> },
    { id: "news" as Tab, label: t("nav_news"), icon: <Newspaper className="w-6 h-6" /> },
    { id: "about" as Tab, label: t("nav_about"), icon: <Building2 className="w-6 h-6" /> },
    { id: "profile" as Tab, label: t("nav_profile"), icon: <User className="w-6 h-6" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-[0_-2px_10px_0_hsl(0_0%_0%/0.04)]">
      <div className="max-w-[600px] mx-auto flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 px-2 min-h-[64px] transition-colors touch-manipulation relative ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? "bg-primary/10 scale-110" : ""}`}>
                {tab.icon}
              </div>
              <span className={`text-xs font-semibold mt-0.5 transition-colors ${isActive ? "text-primary" : ""}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
export type { Tab };
