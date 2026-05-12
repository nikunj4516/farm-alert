import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck, Phone, AlertTriangle, Key } from "lucide-react";
import FarmerEmojiImage from "@/components/FarmerEmojiImage";
import logoWide from "@/assets/farmalert-logo-wide.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";


const getAuthErrorMessage = (message: string) => {
  const normalized = message.toLowerCase();

  if (normalized.includes("unsupported phone provider")) {
    return "Phone OTP is not enabled in Supabase. Enable Authentication > Sign In / Providers > Phone and connect an SMS provider.";
  }

  if (normalized.includes("invalid phone")) {
    return "Please enter a valid 10-digit Indian mobile number.";
  }

  return message;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const formattedPhone = `+91${phone}`;

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      setError(t("login_phone_error"));
      return;
    }
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting a new OTP.`);
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    setLoading(false);

    if (error) {
      setError(getAuthErrorMessage(error.message));
      return;
    }

    setCooldown(60);
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError(t("login_otp_error"));
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: "sms",
    });

    setLoading(false);

    if (error) {
      setError(getAuthErrorMessage(error.message));
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (profile?.name) {
      navigate("/dashboard");
    } else {
      navigate("/profile-setup");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
            <img src={logoWide} alt="FarmAlert Solutions" className="h-12" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("login_welcome")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("login_subtitle")}
            </p>
          </div>
        </div>

        {/* Farmer Illustration */}
        <div className="flex justify-center">
          <FarmerEmojiImage className="h-16 w-16" />
        </div>

        {step === "phone" ? (
          <div className="space-y-5">
            <div className="bg-card rounded-2xl p-5 shadow-card border border-border space-y-4">
              <label className="text-base font-semibold text-foreground flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                {t("login_phone_label")}
              </label>
              <div className="flex items-center border-2 border-border rounded-xl bg-background overflow-hidden focus-within:border-primary transition-colors">
                <span className="text-base font-bold text-muted-foreground px-4 py-4 bg-muted border-r border-border">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  placeholder="9876543210"
                  className="flex-1 text-lg font-bold text-foreground py-4 px-3 bg-transparent outline-none"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("login_phone_helper")}
              </p>
            </div>

            {error && (
              <p className="text-destructive text-sm font-semibold flex items-center justify-center gap-1">
                <AlertTriangle className="w-4 h-4" /> {error}
              </p>
            )}

            <button
              onClick={handleSendOtp}
              disabled={loading || phone.length < 10 || cooldown > 0}
              className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-xl py-3.5 text-base font-semibold active:scale-[0.97] transition-transform touch-manipulation disabled:opacity-40 shadow-md"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : cooldown > 0 ? (
                `Wait ${cooldown}s`
              ) : (
                <>
                  {t("login_send_otp")} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-primary/5 rounded-2xl p-4 flex items-center gap-3 border border-primary/20">
              <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0" />
              <p className="text-sm text-foreground">
                <strong>+91 {phone}</strong>{" "}
                {t("login_otp_sent")}
              </p>
            </div>

            <div className="bg-card rounded-2xl p-5 shadow-card border border-border space-y-4">
              <label className="text-base font-semibold text-foreground flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" /> {t("login_otp_label")}
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                placeholder="● ● ● ● ● ●"
                className="w-full text-center text-2xl font-bold text-foreground py-4 border-2 border-border rounded-xl bg-background outline-none tracking-[0.5em] focus:border-primary transition-colors"
              />
            </div>

            {error && (
              <p className="text-destructive text-sm font-semibold flex items-center justify-center gap-1">
                <AlertTriangle className="w-4 h-4" /> {error}
              </p>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-xl py-3.5 text-base font-semibold active:scale-[0.97] transition-transform touch-manipulation disabled:opacity-40 shadow-md"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {t("login_verify")} <ShieldCheck className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
              }}
              className="w-full text-center text-sm text-muted-foreground font-semibold py-3 touch-manipulation"
            >
              {t("login_change_number")}
            </button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {t("login_secure")}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
