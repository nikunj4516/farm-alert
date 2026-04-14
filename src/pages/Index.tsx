import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WeatherAlertCard from "@/components/WeatherAlertCard";
import FarmingTips from "@/components/FarmingTips";
import AgriNews from "@/components/AgriNews";
import BottomNav, { type Tab } from "@/components/BottomNav";
import { MapPin, Bell, LogOut, Globe } from "lucide-react";
import { useLanguage, Language, languageNames } from "@/contexts/LanguageContext";
import logo from "@/assets/farmalert-logo.png";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("weather");
  const navigate = useNavigate();
  const { language, setLanguage, t, tArray } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const forecastDays = tArray("forecast_days");

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary px-4 py-4 sticky top-0 z-40">
        <div className="max-w-[600px] mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <img src={logo} alt="FarmAlert" className="w-9 h-9" />
              <h1 className="text-farmer-xl font-extrabold text-primary-foreground">
                FarmAlert
              </h1>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4 text-primary-foreground/80" />
              <span className="text-farmer-sm text-primary-foreground/80">
                {t("location")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="bg-primary-foreground/20 rounded-full p-3 active:scale-90 transition-transform touch-manipulation"
              >
                <Globe className="w-6 h-6 text-primary-foreground" />
              </button>
              {showLangMenu && (
                <div className="absolute right-0 top-14 bg-card border-2 border-border rounded-lg shadow-lg z-50 min-w-[140px]">
                  {(["gu", "hi", "en"] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-farmer-sm font-semibold transition-colors touch-manipulation ${
                        language === lang
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {languageNames[lang]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="relative bg-primary-foreground/20 rounded-full p-3 active:scale-90 transition-transform touch-manipulation">
              <Bell className="w-7 h-7 text-primary-foreground" />
              <span className="absolute top-1 right-1 w-3 h-3 bg-alert-red rounded-full" />
            </button>
            <button onClick={() => navigate("/login")} className="bg-primary-foreground/20 rounded-full p-3 active:scale-90 transition-transform touch-manipulation">
              <User className="w-6 h-6 text-primary-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[600px] mx-auto px-4 py-5 space-y-6">
        {activeTab === "weather" && (
          <>
            <WeatherAlertCard
              level="orange"
              title={t("weather_title")}
              description={t("weather_desc")}
              temperature="34°C"
              humidity="82%"
              wind="25 km/h"
            />

            <div className="space-y-3">
              <h2 className="text-farmer-lg font-bold text-foreground">
                {t("forecast_title")}
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { temp: "34°", icon: "🌧️" },
                  { temp: "31°", icon: "⛈️" },
                  { temp: "29°", icon: "🌦️" },
                  { temp: "32°", icon: "⛅" },
                  { temp: "35°", icon: "☀️" },
                ].map((d, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 flex flex-col items-center bg-card border-2 border-border rounded-lg px-5 py-3 min-w-[80px]"
                  >
                    <span className="text-sm font-semibold text-muted-foreground">
                      {forecastDays[i]}
                    </span>
                    <span className="text-2xl my-1">{d.icon}</span>
                    <span className="text-farmer-base font-bold text-foreground">
                      {d.temp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="tel:18001801551"
              className="flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-lg p-4 text-farmer-lg font-bold active:scale-95 transition-transform touch-manipulation"
            >
              {t("helpline")}
            </a>
          </>
        )}

        {activeTab === "tips" && <FarmingTips />}
        {activeTab === "news" && <AgriNews />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
