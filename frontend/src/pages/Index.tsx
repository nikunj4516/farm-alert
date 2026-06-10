import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import FarmingTips from "@/components/FarmingTips";
import AgriNews from "@/components/AgriNews";
import VoiceAssistantButton from "@/components/voice/VoiceAssistantButton";
import BottomNav, { type Tab } from "@/components/BottomNav";
import AboutTab from "@/components/AboutTab";
import ProfileCard from "@/components/ProfileCard";
import FarmerWeatherDashboard from "@/components/weather/FarmerWeatherDashboard";
import AiDiseaseScanner from "@/components/scanner/AiDiseaseScanner";
import { LogOut, Loader2, Phone, LifeBuoy } from "lucide-react";
import { useLanguage, Language, languageNames } from "@/contexts/LanguageContext";
import logo from "@/assets/farmalert-fa.png";
import SupportCenterModal from "@/components/SupportCenterModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { getSavedSubscriptionTier, getActiveSubscriptionTier, markSubscriptionRequired } from "@/services/subscriptionService";
import { ProfileService } from "@/services/profileService";
import type { WeatherReport } from "@/services/weatherService";
import type { VoiceCommandResult } from "@/services/voiceCommandEngine";
import { toast } from "@/components/ui/use-toast";
import { getDistrictLabel, getLocationLabel, getSavedSelectedLocation } from "@/services/gujaratLocationService";

const getWeatherAlertLevel = (weather?: WeatherReport | null) => {
  if (!weather) return "green" as const;

  const condition = weather.weather_condition?.toLowerCase() ?? "";
  const rainfall = weather.rainfall ?? weather.forecast?.[0]?.rainfall ?? 0;
  const wind = weather.wind_speed ?? weather.forecast?.[0]?.windSpeed ?? 0;
  const temperature = weather.temperature ?? 0;
  const uvIndex = weather.uv_index ?? weather.forecast?.[0]?.uvIndex ?? 0;

  if (
    condition.includes("thunder") ||
    condition.includes("storm") ||
    rainfall >= 64.5 ||
    wind >= 62 ||
    temperature >= 45
  ) {
    return "red" as const;
  }

  if (rainfall >= 15.6 || wind >= 40 || temperature >= 40 || uvIndex >= 8) {
    return "orange" as const;
  }

  if (rainfall > 0 || wind >= 25 || temperature >= 35 || uvIndex >= 6) {
    return "yellow" as const;
  }

  return "green" as const;
};

const getWeatherSummary = (weather?: WeatherReport | null) => {
  if (!weather) return null;

  const condition = weather.weather_condition || "Weather update";
  const rainfall = weather.rainfall ?? weather.forecast?.[0]?.rainfall;
  const uvIndex = weather.uv_index ?? weather.forecast?.[0]?.uvIndex;

  const details = [
    rainfall !== null && rainfall !== undefined ? `Rainfall ${Math.round(rainfall)} mm` : null,
    uvIndex !== null && uvIndex !== undefined ? `UV ${Math.round(uvIndex)}` : null,
    weather.isStale ? "Showing last available update" : null,
  ].filter(Boolean);

  return details.length ? `${condition}. ${details.join(" - ")}.` : condition;
};

const languageBadges: Record<Language, string> = {
  gu: "ક",
  hi: "अ",
  en: "A",
};

const isMissingProfileLanguageColumn = (error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error
        ? String((error as { message?: unknown }).message)
        : String(error || "");

  return message.toLowerCase().includes("preferred_language") && message.toLowerCase().includes("profiles");
};

const savePreferredLanguage = async (userId: string, lang: Language) => {
  try {
    await ProfileService.upsertProfile(userId, { preferred_language: lang });
    return true;
  } catch (error) {
    if (isMissingProfileLanguageColumn(error)) {
      return false;
    }
    throw error;
  }
};

const Index = () => {
  const location = useLocation();
  const initialTab = (location.state as { activeTab?: Tab } | null)?.activeTab;
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || "weather");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language, setLanguage, t, tArray } = useLanguage();
  const { user, loading } = useAuth();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [tier, setTier] = useState<"free" | "premium" | "pro">(() => getSavedSubscriptionTier());
  const isPremium = tier !== "free";
  const [showSupportModal, setShowSupportModal] = useState(false);

  const {
    profile,
    weather,
    news,
    tips,
    alerts,
    isProfileLoading,
    isWeatherLoading,
    isNewsLoading,
    errors,
  } = useDashboardData(user?.id, language);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleSubChange = () => {
      setTier(getSavedSubscriptionTier());
    };
    window.addEventListener("farmalert_subscription_changed", handleSubChange);
    return () => {
      window.removeEventListener("farmalert_subscription_changed", handleSubChange);
    };
  }, []);

  useEffect(() => {
    if (loading || !user || isProfileLoading) return;

    if (!ProfileService.isProfileComplete(profile)) {
      navigate("/profile-setup", { replace: true });
      return;
    }

    localStorage.setItem("farmalert_profile_completed", "true");
    localStorage.setItem("farmalert_onboarding_completed", "true");

    const checkPremium = async () => {
      const activeTier = await getActiveSubscriptionTier(user.id);
      setTier(activeTier);
    };

    void checkPremium();
  }, [profile, isProfileLoading, user, loading, navigate]);

  // Simulated Proactive Alert Engine
  useEffect(() => {
    if (!weather || isWeatherLoading) return;
    
    const whatsappAlertsActive = localStorage.getItem("farmalert_whatsapp_alerts") === "true";
    const smsAlertsActive = localStorage.getItem("farmalert_sms_alerts") === "true";
    
    const hasWhatsappAccess = tier !== "free" && whatsappAlertsActive;
    const hasSmsAccess = tier === "pro" && smsAlertsActive;

    const criticalAlerts = weather.agricultureAlerts.filter(a => a.severity === "red" || a.severity === "orange");
    if (criticalAlerts.length === 0) return;

    criticalAlerts.forEach((alert, index) => {
      const locationName = weather.location?.split(",")?.[0]?.trim() || weather.district || "Vasad";
      const cropName = profileWithSavedLocation?.crop_type || "crop";
      
      const messageText = alert.message.replace("{crop}", cropName).replace("{value}", alert.metricValue || "");
      const recommendationText = alert.recommendation;

      if (hasWhatsappAccess) {
        window.setTimeout(() => {
          toast({
            title: `💬 [WhatsApp Alert] FarmAlert - ${locationName}`,
            description: `⚠️ ${alert.type.toUpperCase()}: ${messageText}\nRecommendation: ${recommendationText}\nRisk Level: High`,
            duration: 8000,
          });
        }, (index + 1) * 3000);
      }

      if (hasSmsAccess && alert.severity === "red") {
        window.setTimeout(() => {
          toast({
            title: `🚨 [SMS Emergency Warning]`,
            description: `⚠️ ${alert.type.toUpperCase()}: Storm/Flood Risk at ${locationName}! Avoid fields.`,
            variant: "destructive",
            duration: 9000,
          });
        }, (index + 1) * 4500);
      }
    });
  }, [weather, isWeatherLoading]);

  // Admin notification listener
  useEffect(() => {
    const handleNewComplaint = (e: Event) => {
      const customEvent = e as CustomEvent;
      const notif = customEvent.detail;
      
      toast({
        title: "🚨 [Admin Notification]",
        description: `New complaint received from ${notif.farmer_name} under category "${notif.message.split('"')[1] || ''}"!`,
        variant: "destructive",
        duration: 5000,
      });
    };
    
    window.addEventListener("farmalert_new_complaint", handleNewComplaint);
    return () => {
      window.removeEventListener("farmalert_new_complaint", handleNewComplaint);
    };
  }, []);

  const helplineNumber = "1800-180-1551";
  const helplineText = t("helpline").replace(/^📞\s*/, "");
  const savedLocation = getSavedSelectedLocation();
  const profileWithSavedLocation = profile
    ? {
        ...profile,
        village: profile.village || savedLocation?.village || null,
        taluka: profile.taluka || savedLocation?.taluka || null,
        district: profile.district || savedLocation?.district || null,
      }
    : profile;
  
  const displayVil = isPremium && profileWithSavedLocation?.village ? `${getLocationLabel(profileWithSavedLocation.village, language)}, ` : "";
  const displayTal = isPremium && profileWithSavedLocation?.taluka ? `${getLocationLabel(profileWithSavedLocation.taluka, language)}, ` : "";
  const displayDis = profileWithSavedLocation?.district ? `${getDistrictLabel(profileWithSavedLocation.district, language)}` : "";
  
  const headerLocation = profileWithSavedLocation?.district
    ? `${displayVil}${displayTal}${displayDis}`
    : t("location");

  const handleVoiceCommand = (command: VoiceCommandResult) => {
    switch (command.action) {
      case "weather":
      case "tips":
      case "news":
      case "about":
      case "profile":
        setActiveTab(command.action);
        break;
      case "helpline":
        window.location.href = "tel:18001801551";
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("farmalert_onboarded");
    localStorage.removeItem("farmalert_language_selected");
    navigate("/");
  };

  const handleProfileImageUpload = async (file: File) => {
    if (!user) return undefined;

    try {
      const imageUrl = await ProfileService.uploadProfileImage(user.id, file);
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast({
        title: t("profile_photo_updated"),
        description: t("profile_photo_updated_desc"),
      });
      return imageUrl;
    } catch (error) {
      toast({
        title: t("profile_photo_failed"),
        description: ProfileService.getErrorMessage(error),
        variant: "destructive",
      });
      throw error;
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary px-4 pt-4 pb-5 sticky top-0 z-40 shadow-elevated rounded-b-3xl">
        <div className="max-w-[600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/15 rounded-xl flex items-center justify-center">
              <img src={logo} alt="FarmAlert" className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">
                FarmAlert
              </h1>
              <div className="flex items-center gap-1">
                <span className="text-sm leading-none" aria-hidden="true">📍</span>
                <span className="text-xs text-primary-foreground/70 font-medium">
                  {headerLocation}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                aria-label={t("choose_language")}
                className="relative w-10 h-10 bg-primary-foreground/15 rounded-xl active:scale-90 transition-transform touch-manipulation flex items-center justify-center"
              >
                <span className="text-xl leading-none" aria-hidden="true">🌐</span>
                <span className="absolute -bottom-1 -right-1 min-w-5 h-5 rounded-full bg-primary-foreground text-primary border border-primary/20 px-1 flex items-center justify-center text-[10px]">
                  {languageBadges[language]}
                </span>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 top-12 bg-card border border-border rounded-2xl shadow-elevated z-50 min-w-[140px] overflow-hidden">
                  {(["gu", "hi", "en"] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={async () => {
                        setLanguage(lang);
                        setShowLangMenu(false);
                        if (user) {
                          try {
                            const savedToProfile = await savePreferredLanguage(user.id, lang);
                            if (savedToProfile) {
                              await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
                            }
                          } catch (error) {
                            toast({
                              title: t("language_save_failed"),
                              description: error instanceof Error ? error.message : t("retry_later"),
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors touch-manipulation ${
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
            <VoiceAssistantButton
              language={language}
              onCommand={handleVoiceCommand}
              isPremium={isPremium}
              className="rounded-xl bg-primary-foreground/15 text-primary-foreground"
            />
            <button
              onClick={() => setShowSupportModal(true)}
              title="Help & Support Center"
              className="bg-primary-foreground/15 rounded-xl p-2.5 active:scale-90 transition-transform touch-manipulation flex items-center justify-center text-primary-foreground"
            >
              <LifeBuoy className="w-5 h-5 animate-spin-slow" />
            </button>
            <button
              onClick={handleLogout}
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
            <FarmerWeatherDashboard
              weather={weather}
              cropType={profileWithSavedLocation?.crop_type || profileWithSavedLocation?.crop_name}
              isLoading={isWeatherLoading}
              isPremium={isPremium}
            />
 
            <section className="overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-emerald-50 shadow-elevated">
              <div className="bg-amber-400 px-4 py-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-amber-950">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {t("helpline_toll_free")}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                    <Phone className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-black leading-tight text-foreground">
                      {t("helpline_banner_title")}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-relaxed text-muted-foreground">
                      {t("helpline_banner_desc")}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <a
                         href={`tel:${helplineNumber.replace(/-/g, "")}`}
                        aria-label={`${t("helpline_call_now")} ${helplineText}`}
                        className="rounded-xl bg-primary px-4 py-2.5 text-base font-black text-primary-foreground shadow-sm active:scale-95 transition-transform touch-manipulation"
                      >
                        {helplineNumber}
                      </a>
                      <a
                         href={`tel:${helplineNumber.replace(/-/g, "")}`}
                        aria-label={`${t("helpline_call_now")} ${helplineText}`}
                        className="rounded-xl border border-primary/25 bg-white px-4 py-2.5 text-sm font-black text-primary shadow-sm active:scale-95 transition-transform touch-manipulation"
                      >
                        {t("helpline_call_now")}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
 
        {activeTab === "tips" && <FarmingTips tipsData={tips} />}
        {activeTab === "news" && <AgriNews newsData={news} isLoading={isNewsLoading} />}
        {activeTab === "about" && <AboutTab onOpenSupport={() => setShowSupportModal(true)} />}
        {activeTab === "scanner" && <AiDiseaseScanner isPremium={isPremium} />}
        {activeTab === "profile" && (
          <ProfileCard
            profile={profileWithSavedLocation}
            isLoading={isProfileLoading}
            error={errors.profileError}
            fallbackImageUrl={null}
            onEdit={() => navigate("/profile-setup", { state: { mode: "edit" } })}
            onLogout={handleLogout}
            onImageUpload={handleProfileImageUpload}
            isPremium={isPremium}
          />
        )}

        {user?.id && (
          <SupportCenterModal
            isOpen={showSupportModal}
            onOpenChange={setShowSupportModal}
            userId={user.id}
            userName={profileWithSavedLocation?.name || "Farmer"}
            userPhone={profileWithSavedLocation?.phone || ""}
            userVillage={profileWithSavedLocation?.village || ""}
          />
        )}

      </main>

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        profileImageUrl={
          profileWithSavedLocation?.profile_image_url || 
          (user?.id ? localStorage.getItem(`farmalert_profile_image_url_${user.id}`) : null)
        } 
      />
    </div>
  );
};

export default Index;
