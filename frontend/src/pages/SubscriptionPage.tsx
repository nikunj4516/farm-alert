import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight, RotateCcw, ShieldAlert } from "lucide-react";
import FarmerEmojiImage from "@/components/FarmerEmojiImage";
import VoiceCommandButton from "@/components/VoiceCommandButton";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileService } from "@/services/profileService";
import { SUBSCRIPTION_CHECKED_AT_KEY, consumeSubscriptionRequiredMessage, hasActiveSubscription } from "@/services/subscriptionService";
import logo from "@/assets/farmalert-logo.png";

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<"daily" | "monthly">("daily");
  const [error, setError] = useState("");
  const [showRequiredNotice, setShowRequiredNotice] = useState(false);
  const [checkingRestore, setCheckingRestore] = useState(false);

  const copy = {
    en: {
      required: "Active subscription required to continue.",
      retry: "Retry Subscription",
      restore: "Restore Subscription",
      restoreFailed: "No active subscription found. Please subscribe to continue.",
    },
    hi: {
      required: "आगे बढ़ने के लिए सक्रिय सब्सक्रिप्शन ज़रूरी है।",
      retry: "फिर से सब्सक्राइब करें",
      restore: "सब्सक्रिप्शन रीस्टोर करें",
      restoreFailed: "सक्रिय सब्सक्रिप्शन नहीं मिला। जारी रखने के लिए सब्सक्राइब करें।",
    },
    gu: {
      required: "આગળ વધવા માટે સક્રિય સબ્સ્ક્રિપ્શન જરૂરી છે.",
      retry: "ફરી સબ્સ્ક્રાઇબ કરો",
      restore: "સબ્સ્ક્રિપ્શન રિસ્ટોર કરો",
      restoreFailed: "સક્રિય સબ્સ્ક્રિપ્શન મળ્યું નથી. આગળ વધવા માટે સબ્સ્ક્રાઇબ કરો.",
    },
  }[language];

  useEffect(() => {
    setShowRequiredNotice(consumeSubscriptionRequiredMessage());
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    const guardProfileThenSubscription = async () => {
      const profile = await ProfileService.getProfile(user.id);
      if (!ProfileService.isProfileComplete(profile)) {
        navigate("/profile-setup", { replace: true });
        return;
      }

      const isSubscribed = await hasActiveSubscription(user.id);
      if (isSubscribed) {
        navigate("/dashboard", { state: { activeTab: "weather" }, replace: true });
      }
    };

    void guardProfileThenSubscription();
  }, [user, loading, navigate]);

  useEffect(() => {
    const keepOnSubscription = () => {
      if (localStorage.getItem("farmalert_subscription_active") !== "true") {
        window.history.pushState(null, "", "/subscription");
        setShowRequiredNotice(true);
      }
    };

    window.history.pushState(null, "", "/subscription");
    window.addEventListener("popstate", keepOnSubscription);
    return () => window.removeEventListener("popstate", keepOnSubscription);
  }, []);

  const handleVoiceCommand = (transcript: string) => {
    const command = transcript.toLowerCase();

    if (
      command.includes("benefit") || 
      command.includes("what you get") ||
      command.includes("ફાયદા") ||
      command.includes("લાભ") ||
      command.includes("fayda") ||
      command.includes("fayde") ||
      command.includes("labh") ||
      command.includes("फायदे") ||
      command.includes("लाभ")
    ) {
      document.getElementById("subscription-benefits")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (
      command.includes("gujarati") ||
      command.includes("ગુજરાતી") ||
      command.includes("gujarat")
    ) {
      setLanguage("gu");
      return;
    }

    if (
      command.includes("hindi") ||
      command.includes("हिंदी") ||
      command.includes("हिन्दी")
    ) {
      setLanguage("hi");
      return;
    }

    if (
      command.includes("english") || 
      command.includes("અંગ્રેજી") ||
      command.includes("angreji") ||
      command.includes("अंग्रेजी")
    ) {
      setLanguage("en");
      return;
    }

    if (
      command.includes("daily") ||
      command.includes("દિવસ") ||
      command.includes("दिन") ||
      command.includes("divas") ||
      command.includes("din") ||
      command.includes("roj") ||
      command.includes("roz") ||
      command.includes("રોજ") ||
      command.includes("रोज")
    ) {
      setSelectedPlan("daily");
      return;
    }

    if (
      command.includes("monthly") ||
      command.includes("month") ||
      command.includes("મહિનો") ||
      command.includes("મહિને") ||
      command.includes("महीना") ||
      command.includes("mahina") ||
      command.includes("mahino") ||
      command.includes("masik") ||
      command.includes("માસિક") ||
      command.includes("मासिक")
    ) {
      setSelectedPlan("monthly");
      return;
    }

    if (
      command.includes("subscribe") ||
      command.includes("સબ્સ્ક્રાઇબ") ||
      command.includes("सब्सक्राइब") ||
      command.includes("kharido") ||
      command.includes("le lo") ||
      command.includes("buy")
    ) {
      void handleSubscribe();
    }
  };

  const handleSubscribe = async () => {
    setError("");

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    const { error: upsertError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan: selectedPlan,
          status: "active",
          amount_paise: selectedPlan === "daily" ? 200 : 6000,
          started_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      setError(upsertError.message);
      setShowRequiredNotice(true);
      return;
    }

    localStorage.setItem("farmalert_subscribed", "true");
    localStorage.setItem("farmalert_subscription_active", "true");
    localStorage.setItem(SUBSCRIPTION_CHECKED_AT_KEY, String(Date.now()));
    await ProfileService.upsertProfile(user.id, { subscription_active: true } as Record<string, unknown>).catch(() => null);
    const profile = await ProfileService.getProfile(user.id);
    if (ProfileService.isProfileComplete(profile)) {
      localStorage.setItem("farmalert_profile_completed", "true");
      navigate("/dashboard", { state: { activeTab: "weather" }, replace: true });
    } else {
      navigate("/profile-setup", { replace: true });
    }
  };

  const handleRestoreSubscription = async () => {
    setError("");
    setCheckingRestore(true);
    try {
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const isSubscribed = await hasActiveSubscription(user.id);
      if (isSubscribed) {
        localStorage.setItem("farmalert_subscription_active", "true");
        navigate("/dashboard", { state: { activeTab: "weather" }, replace: true });
        return;
      }

      setShowRequiredNotice(true);
      setError(copy.restoreFailed);
    } finally {
      setCheckingRestore(false);
    }
  };

  const benefits = [
    { icon: "🌧️", text: t("sub_benefit_1") },
    { icon: "🌾", text: t("sub_benefit_2") },
    { icon: "🐛", text: t("sub_benefit_3") },
    { icon: "📍", text: t("sub_benefit_4") },
    { icon: "📞", text: t("sub_benefit_5") },
  ];

  const testimonials = [
    { name: t("sub_testimonial_1_name"), text: t("sub_testimonial_1_text"), icon: "🌾" },
    { name: t("sub_testimonial_2_name"), text: t("sub_testimonial_2_text"), icon: "🌱" },
  ];

  const langToggle = (
    <div className="flex gap-1 bg-secondary rounded-full p-1">
      {(["gu", "hi", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLanguage(l)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            language === l
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          }`}
        >
          {l === "gu" ? "ગુજ" : l === "hi" ? "हिं" : "EN"}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col pb-28">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <img src={logo} alt="FarmAlert" className="h-8 w-8 rounded-lg" />
        <div className="flex items-center gap-2">
          {langToggle}
          <VoiceCommandButton
            onCommand={handleVoiceCommand}
          />
        </div>
      </div>

      <div className="px-5 space-y-5 flex-1 overflow-y-auto">
        {/* Header */}
        {showRequiredNotice && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-card">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-200 p-2">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black leading-relaxed">{copy.required}</p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    className="rounded-xl bg-primary px-3 py-2.5 text-sm font-black text-primary-foreground active:scale-95"
                  >
                    {copy.retry}
                  </button>
                  <button
                    type="button"
                    onClick={handleRestoreSubscription}
                    disabled={checkingRestore}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400 bg-white px-3 py-2.5 text-sm font-black text-amber-950 active:scale-95 disabled:opacity-60"
                  >
                    <RotateCcw className={`h-4 w-4 ${checkingRestore ? "animate-spin" : ""}`} />
                    {copy.restore}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-2"
        >
          <FarmerEmojiImage className="mx-auto mb-3 h-16 w-16" />
          <h1 className="text-2xl font-extrabold text-foreground leading-tight">
            {t("sub_header_title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {t("sub_header_subtitle")}
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-elevated"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />

          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black">₹2</span>
              <span className="text-xl font-semibold opacity-90">/ {t("sub_day")}</span>
            </div>
            <p className="text-sm opacity-80 mt-1">
              {t("sub_just")} ₹60/{t("sub_month")}
            </p>
          </motion.div>

          <div className="relative z-10 mt-4 bg-white/15 rounded-xl px-4 py-3">
            <p className="text-sm font-medium italic leading-relaxed">
              "{t("sub_emotional_line")}"
            </p>
          </div>

          <div className="relative z-10 mt-3 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span className="text-sm font-semibold">{t("sub_best_value")}</span>
          </div>
        </motion.div>

        {/* Benefits */}
        <div id="subscription-benefits" className="space-y-3">
          <h2 className="text-base font-bold text-foreground">
            {t("sub_benefits_title")}
          </h2>
          <div className="space-y-2">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border shadow-card"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-2xl leading-none" aria-hidden="true">{b.icon}</span>
                </div>
                <span className="text-sm font-medium text-foreground leading-snug">
                  {b.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 justify-center">
            <span className="text-base leading-none" aria-hidden="true">🛡️</span>
            <p className="text-sm font-semibold text-primary text-center">
              {t("sub_trusted")}
            </p>
          </div>

          <div className="space-y-2">
            {testimonials.map((tm, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-3 shadow-card"
              >
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "{tm.text}"
                </p>
                <p className="text-xs font-semibold text-foreground mt-2">
                  — {tm.name} <span className="ml-1" aria-hidden="true">{tm.icon}</span>
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground font-medium">
            {t("sub_cancel_anytime")}
          </p>
        </div>

        {/* Payment Methods */}
        <div className="flex items-center justify-center gap-3 py-2">
          {["UPI", "Paytm", "PhonePe", "GPay"].map((p) => (
            <div
              key={p}
              className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-card"
            >
              {p}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-center text-sm font-semibold text-destructive">
            {error}
          </p>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border px-5 py-4 space-y-2 z-50">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubscribe}
          className="w-full h-14 bg-primary text-primary-foreground rounded-xl text-base font-semibold flex items-center justify-center gap-2 shadow-md touch-manipulation transition-transform active:scale-[0.98]"
        >
          {t("sub_cta")}
          <ArrowRight className="w-5 h-5" />
        </motion.button>
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <span className="text-xs leading-none" aria-hidden="true">🛡️</span>
          <span>{t("sub_secure_payment")}</span>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
