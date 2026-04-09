import { CloudSun, Lightbulb, Newspaper, Phone } from "lucide-react";
import { useState } from "react";

type Tab = "weather" | "tips" | "news";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs = [
  { id: "weather" as Tab, label: "હવામાન", icon: CloudSun },
  { id: "tips" as Tab, label: "ટિપ્સ", icon: Lightbulb },
  { id: "news" as Tab, label: "સમાચાર", icon: Newspaper },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border z-50">
      <div className="max-w-[600px] mx-auto flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 px-2 min-h-[64px] transition-colors touch-manipulation ${
                isActive
                  ? "text-primary bg-muted"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="w-7 h-7 mb-1" />
              <span className="text-farmer-sm font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
export type { Tab };
