import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight, RotateCcw, ShieldAlert, Sparkles, X } from "lucide-react";
import FarmerEmojiImage from "@/components/FarmerEmojiImage";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileService } from "@/services/profileService";
import { SUBSCRIPTION_CHECKED_AT_KEY, consumeSubscriptionRequiredMessage, getSavedSubscriptionTier, getActiveSubscriptionTier } from "@/services/subscriptionService";
import logo from "@/assets/farmalert-logo.png";
import { toast } from "@/components/ui/use-toast";

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t, language } = useLanguage();
  const [error, setError] = useState("");
  const [showRequiredNotice, setShowRequiredNotice] = useState(false);
  const [checkingRestore, setCheckingRestore] = useState(false);
  const [submittingTier, setSubmittingTier] = useState<"premium" | "pro" | null>(null);
  const [currentTier, setCurrentTier] = useState<"free" | "premium" | "pro">("free");

  const copyText = {
    en: {
      required: "Subscription required to unlock advanced intelligence features.",
      retry: "Subscribe Now",
      restore: "Restore Subscription",
      restoreFailed: "No active subscription found. Please subscribe to continue.",
      title: "Choose Your Plan",
      subtitle: "Protect Your Crops Before Damage Happens",
      freePlan: "Free Plan",
      freePrice: "₹0",
      freeDesc: "Weather Forecast, News, Tips, Basic Alerts",
      premiumPlan: "Premium Plan",
      premiumPrice: "₹59",
      premiumPeriod: "/ month",
      premiumDesc: "Village-Level Weather, AI Weather Alerts, WhatsApp Notifications, Smart Recommendations",
      proPlan: "Pro Plan",
      proPrice: "₹149",
      proPeriod: "/ month",
      proDesc: "Everything in Premium, Disease Scanner, Voice AI Assistant, SMS Alerts",
      activePlan: "Active",
      selectPlan: "Subscribe Plan",
      trusted: "Trusted by 50,000+ farmers across Gujarat",
      cancelAnytime: "Cancel anytime. Safe & secure payment.",
      featureBreakdown: "Compare Plans",
      features: [
        { name: "Weather Accuracy", free: "District-Level", premium: "Village-Level", pro: "Village-Level" },
        { name: "Farming Tips & News", free: "Standard", premium: "Ad-free", pro: "Ad-free" },
        { name: "Weather Alerts", free: "Basic", premium: "Advanced", pro: "Advanced" },
        { name: "AI recommendations", free: "❌", premium: "✔️", pro: "✔️" },
        { name: "WhatsApp Alerts", free: "❌", premium: "✔️", pro: "✔️" },
        { name: "AI Disease Scanner", free: "❌", premium: "❌", pro: "✔️ (Camera Scan)" },
        { name: "Voice AI Assistant", free: "❌", premium: "❌", pro: "✔️ (Multilingual)" },
        { name: "SMS Emergency Alerts", free: "❌", premium: "❌", pro: "✔️" }
      ],
      backToDashboard: "Continue on Free Plan",
    },
    gu: {
      required: "ખેતી સલાહ અને સ્કેનર સુવિધાઓ મેળવવા માટે સબ્સ્ક્રિપ્શન જરૂરી છે.",
      retry: "હમણાં સબ્સ્ક્રાઇબ કરો",
      restore: "સબ્સ્ક્રિપ્શન રિસ્ટોર કરો",
      restoreFailed: "કોઈ સક્રિય સબ્સ્ક્રિપ્શન મળ્યું નથી. ચાલુ રાખવા માટે સબ્સ્ક્રાઇબ કરો.",
      title: "તમારો પ્લાન પસંદ કરો",
      subtitle: "નુકસાન થાય તે પહેલાં તમારા પાકનું રક્ષણ કરો",
      freePlan: "ફ્રી પ્લાન",
      freePrice: "₹૦",
      freeDesc: "હવામાન આગાહી, કૃષિ સમાચાર, ખેતી માહિતી, સામાન્ય ચેતવણીઓ",
      premiumPlan: "પ્રીમિયમ પ્લાન",
      premiumPrice: "₹૫૯",
      premiumPeriod: "/ મહિને",
      premiumDesc: "ગામ સ્તરનું હવામાન, AI હવામાન એલર્ટ, વોટ્સએપ નોટિફિકેશન, સ્માર્ટ ભલામણો",
      proPlan: "પ્રો પ્લાન",
      proPrice: "₹૧૪૯",
      proPeriod: "/ મહિને",
      proDesc: "પ્રીમિયમનું બધું જ, પાક રોગ સ્કેનર, વોઇસ AI આસિસ્ટન્ટ, SMS એલર્ટ",
      activePlan: "સક્રિય",
      selectPlan: "પ્લાન પસંદ કરો",
      trusted: "ગુજરાતના ૫૦,૦૦૦+ ખેડૂતોનો વિશ્વાસ",
      cancelAnytime: "ગમે ત્યારે રદ કરો. સુરક્ષિત પેમેન્ટ.",
      featureBreakdown: "પ્લાનની સરખામણી",
      features: [
        { name: "હવામાન ચોકસાઈ", free: "જિલ્લા સ્તરે", premium: "ગામ સ્તરે", pro: "ગામ સ્તરે" },
        { name: "ખેતી સમાચાર અને માહિતી", free: "સામાન્ય", premium: "જાહેરાત વગર", pro: "જાહેરાત વગર" },
        { name: "હવામાન ચેતવણીઓ", free: "સામાન્ય", premium: "ખાસ સ્માર્ટ", pro: "ખાસ સ્માર્ટ" },
        { name: "AI કૃષિ ભલામણો", free: "❌", premium: "✔️", pro: "✔️" },
        { name: "વોટ્સએપ ચેતવણીઓ", free: "❌", premium: "✔️", pro: "✔️" },
        { name: "AI પાક રોગ સ્કેનર", free: "❌", premium: "❌", pro: "✔️ (કેમેરા સ્કેન)" },
        { name: "વોઇસ AI આસિસ્ટન્ટ", free: "❌", premium: "❌", pro: "✔️ (અવાજ કમાન્ડ)" },
        { name: "SMS કટોકટી ચેતવણીઓ", free: "❌", premium: "❌", pro: "✔️" }
      ],
      backToDashboard: "ફ્રી પ્લાન ચાલુ રાખો",
    },
    hi: {
      required: "कृषि मौसम अंतर्दृष्टि और रोग स्कैनर के लिए सब्सक्रिप्शन आवश्यक है.",
      retry: "अभी सब्सक्राइब करें",
      restore: "सब्सक्रिप्शन रीस्टोर करें",
      restoreFailed: "कोई सक्रिय सब्सक्रिप्शन नहीं मिला। जारी रखने के लिए सब्सक्राइब करें.",
      title: "अपना प्लान चुनें",
      subtitle: "नुकसान होने से पहले अपनी फसलों की रक्षा करें",
      freePlan: "फ्री प्लान",
      freePrice: "₹0",
      freeDesc: "मौसम पूर्वानुमान, समाचार, टिप्स, सामान्य अलर्ट",
      premiumPlan: "प्रीमियम प्लान",
      premiumPrice: "₹59",
      premiumPeriod: "/ महीना",
      premiumDesc: "गांव-स्तरीय मौसम, AI मौसम अलर्ट, व्हाट्सएप सूचनाएं, स्मार्ट सिफारिशें",
      proPlan: "प्रो प्लान",
      proPrice: "₹149",
      proPeriod: "/ महीना",
      proDesc: "प्रीमियम का सब कुछ, फसल रोग स्कैनर, वॉयस AI सहायक, एसएमएस अलर्ट",
      activePlan: "सक्रिय",
      selectPlan: "प्लान चुनें",
      trusted: "गुजरात के 50,000+ किसानों का भरोसा",
      cancelAnytime: "कभी भी रद्द करें। सुरक्षित भुगतान.",
      featureBreakdown: "प्लान की तुलना",
      features: [
        { name: "मौसम की सटीकता", free: "जिला स्तर", premium: "गांव स्तर", pro: "गांव स्तर" },
        { name: "कृषि टिप्स और समाचार", free: "सामान्य", premium: "विज्ञापन मुक्त", pro: "विज्ञापन मुक्त" },
        { name: "मौसम अलर्ट", free: "बुनियादी", premium: "उन्नत", pro: "उन्नत" },
        { name: "AI कृषि सलाह", free: "❌", premium: "✔️", pro: "✔️" },
        { name: "व्हाट्सएप अलर्ट", free: "❌", premium: "✔️", pro: "✔️" },
        { name: "AI फसल रोग स्कैनर", free: "❌", premium: "❌", pro: "✔️ (कैमरा स्कैन)" },
        { name: "वॉयस AI सहायक", free: "❌", premium: "❌", pro: "✔️ (वॉयस निर्देश)" },
        { name: "एसएमएस आपातकालीन अलर्ट", free: "❌", premium: "❌", pro: "✔️" }
      ],
      backToDashboard: "फ्री प्लान जारी रखें",
    }
  };
  const copy = copyText[language as "en" | "gu" | "hi"] || copyText.en;

  useEffect(() => {
    setShowRequiredNotice(consumeSubscriptionRequiredMessage());
    setCurrentTier(getSavedSubscriptionTier());
  }, []);

  useEffect(() => {
    const handleSubChange = () => {
      setCurrentTier(getSavedSubscriptionTier());
    };
    window.addEventListener("farmalert_subscription_changed", handleSubChange);
    return () => {
      window.removeEventListener("farmalert_subscription_changed", handleSubChange);
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubscribe = async (tier: "premium" | "pro") => {
    if (!user) return;
    setError("");
    setSubmittingTier(tier);

    try {
      const { error: upsertError } = await supabase
        .from("user_subscriptions")
        .upsert(
          {
            user_id: user.id,
            plan_type: tier.toUpperCase(),
            subscription_status: "active",
            updated_at: new Date().toISOString()
          },
          { onConflict: "user_id" }
        );

      if (upsertError) {
        setError(upsertError.message);
        return;
      }

      localStorage.setItem("farmalert_subscribed", "true");
      localStorage.setItem("farmalert_subscription_active", "true");
      localStorage.setItem("farmalert_subscription_tier", tier);
      localStorage.setItem(SUBSCRIPTION_CHECKED_AT_KEY, String(Date.now()));
      
      try {
        await ProfileService.upsertProfile(user.id, { subscription_active: true } as Record<string, unknown>);
      } catch (profileErr) {
        console.warn("Profile sync failed in handleSubscribe, continuing:", profileErr);
      }
      
      setCurrentTier(tier);
      window.dispatchEvent(new Event("farmalert_subscription_changed"));
      navigate("/dashboard", { state: { activeTab: "weather" }, replace: true });
    } catch (err: any) {
      setError(err.message || "Subscription failed");
    } finally {
      setSubmittingTier(null);
    }
  };

  const handleTestSwitch = async (tier: "free" | "premium" | "pro") => {
    if (!user) return;
    setError("");
    setSubmittingTier(tier === "free" ? null : tier);

    try {
      if (tier === "free") {
        const { error: subError } = await supabase
          .from("user_subscriptions")
          .upsert(
            {
              user_id: user.id,
              plan_type: "FREE",
              subscription_status: "inactive",
              updated_at: new Date().toISOString()
            },
            { onConflict: "user_id" }
          );

        if (subError) throw subError;

        localStorage.removeItem("farmalert_subscribed");
        localStorage.removeItem("farmalert_subscription_active");
        localStorage.setItem("farmalert_subscription_tier", "free");
        localStorage.setItem(SUBSCRIPTION_CHECKED_AT_KEY, String(Date.now()));

        try {
          await ProfileService.upsertProfile(user.id, { subscription_active: false } as Record<string, unknown>);
        } catch (profileErr) {
          console.warn("Profile sync failed in handleTestSwitch, continuing:", profileErr);
        }

        setCurrentTier("free");
        toast({
          title: "Test Mode: Free Tier Activated",
          description: "All premium/pro features are now locked.",
        });
      } else {
        const { error: subError } = await supabase
          .from("user_subscriptions")
          .upsert(
            {
              user_id: user.id,
              plan_type: tier.toUpperCase(),
              subscription_status: "active",
              updated_at: new Date().toISOString()
            },
            { onConflict: "user_id" }
          );

        if (subError) throw subError;

        localStorage.setItem("farmalert_subscribed", "true");
        localStorage.setItem("farmalert_subscription_active", "true");
        localStorage.setItem("farmalert_subscription_tier", tier);
        localStorage.setItem(SUBSCRIPTION_CHECKED_AT_KEY, String(Date.now()));

        try {
          await ProfileService.upsertProfile(user.id, { subscription_active: true } as Record<string, unknown>);
        } catch (profileErr) {
          console.warn("Profile sync failed in handleTestSwitch, continuing:", profileErr);
        }

        setCurrentTier(tier);
        toast({
          title: `Test Mode: ${tier.toUpperCase()} Tier Activated`,
          description: `All ${tier} features are now unlocked.`,
        });
      }

      window.dispatchEvent(new Event("farmalert_subscription_changed"));
    } catch (err: any) {
      // Local storage fallback
      if (tier === "free") {
        localStorage.removeItem("farmalert_subscribed");
        localStorage.removeItem("farmalert_subscription_active");
        localStorage.setItem("farmalert_subscription_tier", "free");
        setCurrentTier("free");
      } else {
        localStorage.setItem("farmalert_subscribed", "true");
        localStorage.setItem("farmalert_subscription_active", "true");
        localStorage.setItem("farmalert_subscription_tier", tier);
        setCurrentTier(tier);
      }
      localStorage.setItem(SUBSCRIPTION_CHECKED_AT_KEY, String(Date.now()));
      
      toast({
        title: `Test Mode: Local ${tier.toUpperCase()} Activated`,
        description: `Running with local storage simulation.`,
      });
      window.dispatchEvent(new Event("farmalert_subscription_changed"));
    } finally {
      setSubmittingTier(null);
    }
  };

  const handleRestoreSubscription = async () => {
    setError("");
    setCheckingRestore(true);
    try {
      if (!user) return;
      const tier = await getActiveSubscriptionTier(user.id);
      if (tier !== "free") {
        setCurrentTier(tier);
        localStorage.setItem("farmalert_subscription_active", "true");
        localStorage.setItem("farmalert_subscription_tier", tier);
        navigate("/dashboard", { state: { activeTab: "weather" }, replace: true });
        return;
      }
      setError(copy.restoreFailed);
    } finally {
      setCheckingRestore(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-10">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-4 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <img src={logo} alt="FarmAlert" className="h-8 w-8 rounded-lg" />
          <span className="text-lg font-black text-slate-800 tracking-tight">FarmAlert Premium</span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-all active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 space-y-6 flex-1 overflow-y-auto max-w-[480px] mx-auto py-5">
        {showRequiredNotice && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-md">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-200 p-2 text-amber-600">
                <ShieldAlert className="h-5 w-5 animate-bounce" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black leading-relaxed">{copy.required}</p>
              </div>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="text-center space-y-2">
          <FarmerEmojiImage className="mx-auto h-16 w-16" />
          <h1 className="text-2xl font-black text-slate-900 leading-tight">{copy.title}</h1>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">{copy.subtitle}</p>
        </div>

        {/* Developer Sandbox Test Mode Switcher */}
        <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-3xl p-5 space-y-3 shadow-sm text-left animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-800 font-black text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>🔬 Developer Test Switcher</span>
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase border tracking-wider ${
              currentTier === "pro" 
                ? "bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]"
                : currentTier === "premium"
                  ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                  : "bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]"
            }`}>
              Current: {currentTier}
            </span>
          </div>
          <p className="text-[10px] text-amber-700 font-semibold leading-normal">
            Since payment gateway integration is currently in sandbox/mock, use this dashboard to instantly toggle subscription tiers for locks, scanner, and alert testing.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => handleTestSwitch("free")}
              className={`py-2 px-1 text-center rounded-xl text-[10px] font-black transition-all active:scale-95 border ${
                currentTier === "free"
                  ? "bg-slate-500 text-white border-slate-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              FREE Plan
            </button>
            <button
              onClick={() => handleTestSwitch("premium")}
              className={`py-2 px-1 text-center rounded-xl text-[10px] font-black transition-all active:scale-95 border ${
                currentTier === "premium"
                  ? "bg-blue-600 text-white border-blue-700 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              PREMIUM
            </button>
            <button
              onClick={() => handleTestSwitch("pro")}
              className={`py-2 px-1 text-center rounded-xl text-[10px] font-black transition-all active:scale-95 border ${
                currentTier === "pro"
                  ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              PRO Plan
            </button>
          </div>
        </div>

        {/* Plan Tiers Cards */}
        <div className="grid gap-5">
          {/* Free Plan Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 relative shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  {copy.freePlan}
                </span>
                <p className="text-3xl font-black text-slate-800 mt-2">{copy.freePrice}</p>
              </div>
              {currentTier === "free" && (
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {copy.activePlan}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-3 leading-relaxed">{copy.freeDesc}</p>
          </div>

          {/* Premium Plan Card */}
          <div className={`rounded-3xl border-2 p-5 relative shadow-md overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/10 transition-all ${
            currentTier === "premium" ? "border-emerald-500 bg-emerald-50/20" : "border-emerald-600/70"
          }`}>
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
              Best Value
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                {copy.premiumPlan}
              </span>
              <div className="flex items-baseline mt-2">
                <p className="text-3xl font-black text-slate-800">{copy.premiumPrice}</p>
                <p className="text-xs font-bold text-slate-500 ml-1">{copy.premiumPeriod}</p>
              </div>
            </div>
            
            <p className="text-xs font-semibold text-slate-500 mt-3 leading-relaxed">{copy.premiumDesc}</p>

            <button
              onClick={() => handleSubscribe("premium")}
              disabled={submittingTier !== null || currentTier === "premium"}
              className={`w-full mt-4 h-11 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all ${
                currentTier === "premium"
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-default shadow-none"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {submittingTier === "premium" ? "Processing..." : currentTier === "premium" ? copy.activePlan : `${copy.selectPlan} (₹59)`}
              {currentTier !== "premium" && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Pro Plan Card */}
          <div className={`rounded-3xl border-2 p-5 relative shadow-lg overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/10 transition-all ${
            currentTier === "pro" ? "border-blue-500 bg-blue-50/20" : "border-blue-600/70"
          }`}>
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
              Most Popular
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                {copy.proPlan}
              </span>
              <div className="flex items-baseline mt-2">
                <p className="text-3xl font-black text-slate-800">{copy.proPrice}</p>
                <p className="text-xs font-bold text-slate-500 ml-1">{copy.proPeriod}</p>
              </div>
            </div>
            
            <p className="text-xs font-semibold text-slate-500 mt-3 leading-relaxed">{copy.proDesc}</p>

            <button
              onClick={() => handleSubscribe("pro")}
              disabled={submittingTier !== null || currentTier === "pro"}
              className={`w-full mt-4 h-11 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all ${
                currentTier === "pro"
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-default shadow-none"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {submittingTier === "pro" ? "Processing..." : currentTier === "pro" ? copy.activePlan : `${copy.selectPlan} (₹149)`}
              {currentTier !== "pro" && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            {copy.featureBreakdown}
          </h3>
          
          <div className="overflow-hidden border border-slate-100 rounded-2xl divide-y divide-slate-100">
            {/* Header row */}
            <div className="grid grid-cols-12 p-3 text-[10px] font-black text-slate-400 bg-slate-50 gap-1">
              <div className="col-span-4">Feature</div>
              <div className="col-span-2 text-center">Free</div>
              <div className="col-span-3 text-center text-emerald-700">Premium</div>
              <div className="col-span-3 text-center text-blue-700">Pro</div>
            </div>
            {copy.features.map((f, i) => (
              <div key={i} className="grid grid-cols-12 p-3 text-xs gap-1 hover:bg-slate-50/50 transition-all items-center">
                <div className="col-span-4 font-bold text-slate-700 leading-tight">{f.name}</div>
                <div className="col-span-2 text-center text-[10px] font-semibold text-slate-400">{f.free}</div>
                <div className="col-span-3 text-center text-[10px] font-black text-emerald-600">{f.premium}</div>
                <div className="col-span-3 text-center text-[10px] font-black text-blue-600">{f.pro}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Payment details */}
        <div className="space-y-4 text-center">
          <p className="text-[10px] font-bold text-emerald-700 flex items-center justify-center gap-1.5">
            <span>🛡️</span> {copy.trusted}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold">{copy.cancelAnytime}</p>

          <div className="flex gap-2 justify-center py-2 opacity-80">
            {["UPI", "GPay", "PhonePe", "Cards"].map(p => (
              <span key={p} className="bg-slate-100 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-500 border border-slate-200">
                {p}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleRestoreSubscription}
              disabled={checkingRestore}
              className="text-xs text-emerald-600 font-black underline flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${checkingRestore ? "animate-spin" : ""}`} />
              {copy.restore}
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xs text-slate-400 font-bold hover:text-slate-600 mt-2"
            >
              {copy.backToDashboard}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-center text-xs font-black text-red-600 mt-2">{error}</p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
