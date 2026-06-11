import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

type Tab = "weather" | "tips" | "news" | "scanner" | "about" | "profile";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  profileImageUrl?: string | null;
}

const BottomNav = ({ activeTab, onTabChange, profileImageUrl }: BottomNavProps) => {
  const { t, language } = useLanguage();

  const tabs = [
    { id: "weather" as Tab, label: t("nav_weather"), icon: "partly_cloudy_day" },
    { id: "tips" as Tab, label: t("nav_tips"), icon: "tips_and_updates" },
    { id: "news" as Tab, label: t("nav_news"), icon: "newspaper" },
    { id: "scanner" as Tab, label: language === "gu" ? "સ્કેનર" : language === "hi" ? "स्कैनर" : "Scanner", icon: "center_focus_strong" },
    { id: "about" as Tab, label: t("nav_about"), icon: "info" },
    { id: "profile" as Tab, label: t("nav_profile"), icon: "account_circle" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-[0_-2px_12px_0_rgba(0,0,0,0.03)] pb-safe">
      <div className="max-w-[600px] mx-auto flex items-center justify-around h-16 sm:h-20 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isProfileTab = tab.id === "profile";

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
              className="flex-1 flex flex-col items-center justify-center h-full relative group touch-manipulation focus:outline-none"
            >
              {/* Active Indicator Pill */}
              <div className="relative flex items-center justify-center w-12 sm:w-16 h-8 rounded-full mb-1">
                {isActive && (
                  <motion.div
                    layoutId="md3ActiveIndicatorPill"
                    className="absolute inset-0 bg-emerald-100 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                {isProfileTab && profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className={`relative z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border transition-all duration-200 ${
                      isActive ? "border-emerald-600 ring-2 ring-emerald-500/20" : "border-slate-300"
                    }`}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.parentElement?.querySelector(".fallback-profile-icon");
                      if (fallback) (fallback as HTMLElement).style.display = "inline-block";
                    }}
                  />
                ) : null}

                {(!isProfileTab || !profileImageUrl) ? (
                  <span
                    className="material-symbols-rounded relative z-10 select-none text-2xl sm:text-[26px] md:text-3xl transition-colors duration-200"
                    style={{
                      fontVariationSettings: isActive 
                        ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" 
                        : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                      color: isActive ? "#065f46" : "#94a3b8"
                    }}
                  >
                    {tab.icon}
                  </span>
                ) : (
                  <span
                    className="fallback-profile-icon material-symbols-rounded relative z-10 select-none text-2xl sm:text-[26px] md:text-3xl transition-colors duration-200"
                    style={{
                      display: "none",
                      fontVariationSettings: isActive 
                        ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" 
                        : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                      color: isActive ? "#065f46" : "#94a3b8"
                    }}
                  >
                    account_circle
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[9px] sm:text-xs font-black tracking-wider transition-colors duration-200 select-none ${
                  isActive ? "text-emerald-800" : "text-slate-400 group-hover:text-slate-600"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
export type { Tab };
