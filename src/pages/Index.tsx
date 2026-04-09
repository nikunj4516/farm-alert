import { useState } from "react";
import WeatherAlertCard from "@/components/WeatherAlertCard";
import FarmingTips from "@/components/FarmingTips";
import AgriNews from "@/components/AgriNews";
import BottomNav, { type Tab } from "@/components/BottomNav";
import { MapPin, Bell, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("weather");
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary px-4 py-4 sticky top-0 z-40">
        <div className="max-w-[600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-farmer-xl font-extrabold text-primary-foreground">
              🌾 FarmAlert
            </h1>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4 text-primary-foreground/80" />
              <span className="text-farmer-sm text-primary-foreground/80">
                અમદાવાદ, ગુજરાત
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative bg-primary-foreground/20 rounded-full p-3 active:scale-90 transition-transform touch-manipulation">
              <Bell className="w-7 h-7 text-primary-foreground" />
              <span className="absolute top-1 right-1 w-3 h-3 bg-alert-red rounded-full" />
            </button>
            <button onClick={signOut} className="bg-primary-foreground/20 rounded-full p-3 active:scale-90 transition-transform touch-manipulation">
              <LogOut className="w-6 h-6 text-primary-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[600px] mx-auto px-4 py-5 space-y-6">
        {activeTab === "weather" && (
          <>
            <WeatherAlertCard
              level="orange"
              title="આજે ભારે વરસાદ"
              description="બપોર 2 થી 6 વાગ્યા સુધી ભારે વરસાદની શક્યતા. પાક ઢાંકી દો."
              temperature="34°C"
              humidity="82%"
              wind="25 km/h"
            />

            {/* 5-day forecast */}
            <div className="space-y-3">
              <h2 className="text-farmer-lg font-bold text-foreground">
                📅 5 દિવસ
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { day: "આજે", temp: "34°", icon: "🌧️" },
                  { day: "કાલે", temp: "31°", icon: "⛈️" },
                  { day: "ગુરુ", temp: "29°", icon: "🌦️" },
                  { day: "શુક્ર", temp: "32°", icon: "⛅" },
                  { day: "શનિ", temp: "35°", icon: "☀️" },
                ].map((d, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 flex flex-col items-center bg-card border-2 border-border rounded-lg px-5 py-3 min-w-[80px]"
                  >
                    <span className="text-sm font-semibold text-muted-foreground">
                      {d.day}
                    </span>
                    <span className="text-2xl my-1">{d.icon}</span>
                    <span className="text-farmer-base font-bold text-foreground">
                      {d.temp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency helpline */}
            <a
              href="tel:18001801551"
              className="flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-lg p-4 text-farmer-lg font-bold active:scale-95 transition-transform touch-manipulation"
            >
              📞 કિસાન હેલ્પલાઇન: 1800-180-1551
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
