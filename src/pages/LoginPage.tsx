import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck, Phone } from "lucide-react";
import logoWide from "@/assets/farmalert-logo-wide.png";
import { useLanguage } from "@/contexts/LanguageContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setError(t("login_phone_error"));
      return;
    }
    setStep("otp");
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setError(t("login_otp_error"));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("farmalert_logged_in", "true");
      navigate("/profile-setup");
    }, 1000);
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
            <h1 className="text-farmer-xl font-extrabold text-foreground">
              {t("login_welcome")}
            </h1>
            <p className="text-farmer-sm text-muted-foreground mt-1">
              {t("login_subtitle")}
            </p>
          </div>
        </div>

        {/* Farmer Illustration */}
        <div className="flex justify-center">
          <div className="text-6xl">👨‍🌾</div>
        </div>

        {step === "phone" ? (
          <div className="space-y-5">
            <div className="bg-card rounded-2xl p-5 shadow-card border border-border space-y-4">
              <label className="text-farmer-base font-semibold text-foreground flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                {t("login_phone_label")}
              </label>
              <div className="flex items-center border-2 border-border rounded-xl bg-background overflow-hidden focus-within:border-primary transition-colors">
                <span className="text-farmer-base font-bold text-muted-foreground px-4 py-4 bg-muted border-r border-border">
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
                  className="flex-1 text-farmer-lg font-bold text-foreground py-4 px-3 bg-transparent outline-none"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("login_phone_helper")}
              </p>
            </div>

            {error && (
              <p className="text-destructive text-farmer-sm font-semibold text-center">
                ⚠️ {error}
              </p>
            )}

            <button
              onClick={handleSendOtp}
              disabled={phone.length < 10}
              className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-2xl py-4 text-farmer-lg font-bold active:scale-[0.97] transition-transform touch-manipulation disabled:opacity-40 shadow-elevated"
            >
              {t("login_send_otp")} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-primary/5 rounded-2xl p-4 flex items-center gap-3 border border-primary/20">
              <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0" />
              <p className="text-farmer-sm text-foreground">
                <strong>+91 {phone}</strong> {t("login_otp_sent")}
              </p>
            </div>

            <div className="bg-card rounded-2xl p-5 shadow-card border border-border space-y-4">
              <label className="text-farmer-base font-semibold text-foreground flex items-center gap-2">
                🔑 {t("login_otp_label")}
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
                className="w-full text-center text-farmer-2xl font-bold text-foreground py-4 border-2 border-border rounded-xl bg-background outline-none tracking-[0.5em] focus:border-primary transition-colors"
              />
            </div>

            {error && (
              <p className="text-destructive text-farmer-sm font-semibold text-center">
                ⚠️ {error}
              </p>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-2xl py-4 text-farmer-lg font-bold active:scale-[0.97] transition-transform touch-manipulation disabled:opacity-40 shadow-elevated"
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
              className="w-full text-center text-farmer-sm text-muted-foreground font-semibold py-3 touch-manipulation"
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
