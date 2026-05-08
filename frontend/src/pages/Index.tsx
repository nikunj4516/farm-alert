import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WeatherAlertCard from "@/components/WeatherAlertCard";
import FarmerEmojiImage from "@/components/FarmerEmojiImage";
import FarmingTips from "@/components/FarmingTips";
import AgriNews from "@/components/AgriNews";
import QuickActions from "@/components/QuickActions";
import VoiceCommandButton from "@/components/VoiceCommandButton";
import WakeWordListener from "@/components/WakeWordListener";
import BottomNav, { type Tab } from "@/components/BottomNav";
import AboutTab from "@/components/AboutTab";
import { Bell, LogOut, Globe } from "lucide-react";
import { useLanguage, Language, languageNames } from "@/contexts/LanguageContext";
import logo from "@/assets/farmalert-fa.png";
import userDp from "@/assets/user-dp.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("weather");
  const navigate = useNavigate();
  const { language, setLanguage, t, tArray } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const forecastDays = tArray("forecast_days");
  const helplineText = t("helpline").replace(/^📞\s*/, "");

  const handleVoiceCommand = (transcript: string) => {
    const command = transcript.toLowerCase();

    // Check for Wake Word
    if (command.includes("hey farm") || command.includes("hey farmalert") || command.includes("farm alert")) {
      // It's a wake word command, user might say "hey farmalert weather"
      // the string will contain both. We just let it fall through to the specific handlers.
    }

    if (
      command.includes("weather") ||
      command.includes("મોસમ") ||
      command.includes("હવામાન") ||
      command.includes("मौसम") ||
      command.includes("havaman") ||
      command.includes("mausam") ||
      command.includes("mosam") ||
      command.includes("tapman") ||
      command.includes("વરસાદ") ||
      command.includes("varsad") ||
      command.includes("baarish") ||
      command.includes("barish") ||
      command.includes("rain") ||
      command.includes("બારીશ")
    ) {
      setActiveTab("weather");
      return;
    }

    if (
      command.includes("tips") ||
      command.includes("tip") ||
      command.includes("ટિપ્સ") ||
      command.includes("सलाह") ||
      command.includes("टिप्स") ||
      command.includes("salah") ||
      command.includes("sujav") ||
      command.includes("sujhav") ||
      command.includes("mahiti") ||
      command.includes("kheti") ||
      command.includes("ખેતી") ||
      command.includes("खेती")
    ) {
      setActiveTab("tips");
      return;
    }

    if (
      command.includes("news") ||
      command.includes("સમાચાર") ||
      command.includes("न्यूज़") ||
      command.includes("समाचार") ||
      command.includes("samachar") ||
      command.includes("khabar") ||
      command.includes("taaja") ||
      command.includes("bajar") ||
      command.includes("bhav") ||
      command.includes("ખબર") ||
      command.includes("खबर")
    ) {
      setActiveTab("news");
      return;
    }

    if (
      command.includes("about") ||
      command.includes("અમારા વિશે") ||
      command.includes("हमारे बारे में") ||
      command.includes("company") ||
      command.includes("founder")
    ) {
      setActiveTab("about");
      return;
    }

    if (
      command.includes("profile") ||
      command.includes("પ્રોફાઇલ") ||
      command.includes("प्रोफाइल") ||
      command.includes("profil") ||
      command.includes("maru") ||
      command.includes("mera") ||
      command.includes("khata")
    ) {
      setActiveTab("profile");
      return;
    }

    if (
      command.includes("setup") ||
      command.includes("edit profile") ||
      command.includes("માહિતી") ||
      command.includes("जानकारी") ||
      command.includes("jankari") ||
      command.includes("badlo") ||
      command.includes("sudharo")
    ) {
      navigate("/profile-setup");
      return;
    }

    if (
      command.includes("call") ||
      command.includes("helpline") ||
      command.includes("કોલ") ||
      command.includes("હેલ્પલાઇન") ||
      command.includes("हेल्पलाइन") ||
      command.includes("phone") ||
      command.includes("fon") ||
      command.includes("fone") ||
      command.includes("madad") ||
      command.includes("મદદ") ||
      command.includes("मदद")
    ) {
      window.location.href = "tel:18001801551";
    }
  };

  const handleWakeWord = () => {
    toast.success("Farmalert Assistant Activated!", {
      description: "Listening for your command...",
    });
    // Programmatically click the mic button to start the actual command listener
    const btn = document.getElementById("voice-command-btn");
    if (btn) btn.click();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <WakeWordListener onWakeWord={handleWakeWord} />
      {/* Header */}
      <header className="bg-primary px-4 pt-4 pb-5 sticky top-0 z-40 shadow-elevated rounded-b-3xl">
        <div className="max-w-[600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/15 rounded-xl flex items-center justify-center">
              <img src={logo} alt="FarmAlert" className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-farmer-lg font-extrabold text-primary-foreground">
                FarmAlert
              </h1>
              <div className="flex items-center gap-1">
                <span className="text-sm">📍</span>
                <span className="text-xs text-primary-foreground/70 font-medium">
                  {t("location")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="bg-primary-foreground/15 rounded-xl p-2.5 active:scale-90 transition-transform touch-manipulation"
              >
                <Globe className="w-5 h-5 text-primary-foreground" />
              </button>
              {showLangMenu && (
                <div className="absolute right-0 top-12 bg-card border border-border rounded-2xl shadow-elevated z-50 min-w-[140px] overflow-hidden">
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
            <button className="relative bg-primary-foreground/15 rounded-xl p-2.5 active:scale-90 transition-transform touch-manipulation">
              <Bell className="w-5 h-5 text-primary-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-alert-red rounded-full border-2 border-primary" />
            </button>
            <VoiceCommandButton
              helpText="Say: weather, tips, news, profile, call helpline"
              onCommand={handleVoiceCommand}
              className="rounded-xl bg-primary-foreground/15 text-primary-foreground"
            />
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                localStorage.removeItem("farmalert_onboarded");
                localStorage.removeItem("farmalert_logged_in");
                navigate("/");
              }}
              className="bg-primary-foreground/15 rounded-xl p-2.5 active:scale-90 transition-transform touch-manipulation"
            >
              <LogOut className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[600px] mx-auto px-4 py-5 space-y-5">
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

            <QuickActions />

            {/* 5-day forecast */}
            <div className="space-y-3">
              <h2 className="text-farmer-base font-bold text-foreground">
                {t("forecast_title")}
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {[
                  { temp: "34°", icon: "🌧️" },
                  { temp: "31°", icon: "⛈️" },
                  { temp: "29°", icon: "🌦️" },
                  { temp: "32°", icon: "⛅" },
                  { temp: "35°", icon: "☀️" },
                ].map((d, i) => (
                  <div
                    key={i}
                    className={`flex-shrink-0 flex flex-col items-center bg-card border border-border rounded-2xl px-4 py-3 min-w-[76px] shadow-card transition-shadow ${
                      i === 0 ? "border-primary/40 bg-primary/5" : ""
                    }`}
                  >
                    <span className="text-xs font-semibold text-muted-foreground">
                      {forecastDays[i]}
                    </span>
                    <span className="text-2xl my-1.5">{d.icon}</span>
                    <span className="text-farmer-sm font-bold text-foreground">
                      {d.temp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Helpline */}
            <a
              href="tel:18001801551"
              className="flex items-center justify-center gap-3 bg-primary/10 text-primary rounded-2xl p-4 text-farmer-base font-bold active:scale-[0.97] transition-transform touch-manipulation border border-primary/20"
            >
              <span aria-hidden="true">📞</span>
              <span>{helplineText}</span>
            </a>
          </>
        )}

        {activeTab === "tips" && <FarmingTips />}
        {activeTab === "news" && <AgriNews />}
        {activeTab === "about" && <AboutTab />}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <img 
                src={userDp} 
                alt="User Profile" 
                className="mx-auto mb-4 h-24 w-24 rounded-full object-cover border-2 border-primary/20 shadow-sm" 
              />
              <h2 className="text-farmer-lg font-bold text-foreground">
                {t("profile_title")}
              </h2>
              <p className="text-muted-foreground text-farmer-sm mt-1">
                {t("profile_subtitle")}
              </p>
            </div>
            <button
              onClick={() => navigate("/profile-setup")}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-farmer-base font-bold active:scale-[0.97] transition-transform touch-manipulation shadow-elevated"
            >
              {t("profile_save")}
            </button>
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
