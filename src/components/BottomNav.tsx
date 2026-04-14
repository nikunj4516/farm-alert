import { CloudSun, Lightbulb, Newspaper, UserCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Tab = "weather" | "tips" | "news" | "profile";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const { t } = useLanguage();

  const tabs = [
    { id: "weather" as Tab, label: t("nav_weather"), icon: CloudSun },
    { id: "tips" as Tab, label: t("nav_tips"), icon: Lightbulb },
    { id: "news" as Tab, label: t("nav_news"), icon: Newspaper },
    { id: "profile" as Tab, label: t("nav_profile"), icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-[0_-2px_10px_0_hsl(0_0%_0%/0.04)]">
      <div className="max-w-[600px] mx-auto flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 px-2 min-h-[64px] transition-all touch-manipulation relative ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
              )}
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-primary/10" : ""}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-semibold mt-0.5 ${isActive ? "text-primary" : ""}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
export type { Tab };
