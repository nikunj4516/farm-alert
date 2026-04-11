import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
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
      navigate("/profile-setup");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <img src={logoWide} alt="FarmAlert Solutions" className="h-16 mx-auto" />
          <p className="text-farmer-base text-muted-foreground mt-3">
            {t("splash_tagline")}
          </p>
        </div>

        {step === "phone" ? (
          <div className="space-y-5">
            <div>
              <label className="text-farmer-base font-semibold text-foreground block mb-2">
                {t("login_phone_label")}
              </label>
              <div className="flex items-center border-2 border-border rounded-lg bg-card overflow-hidden focus-within:border-primary">
                <span className="text-farmer-base font-bold text-muted-foreground px-4 bg-muted py-4">
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
                  className="flex-1 text-farmer-lg font-bold text-foreground py-4 px-3 bg-card outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="text-destructive text-farmer-sm font-semibold">
                ⚠️ {error}
              </p>
            )}

            <button
              onClick={handleSendOtp}
              disabled={phone.length < 10}
              className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-lg py-5 text-farmer-lg font-bold active:scale-95 transition-transform touch-manipulation disabled:opacity-50"
            >
              {t("login_send_otp")} <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0" />
              <p className="text-farmer-sm text-foreground">
                <strong>+91 {phone}</strong> {t("login_otp_sent")}
              </p>
            </div>

            <div>
              <label className="text-farmer-base font-semibold text-foreground block mb-2">
                {t("login_otp_label")}
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
                className="w-full text-center text-farmer-2xl font-bold text-foreground py-4 border-2 border-border rounded-lg bg-card outline-none tracking-[0.5em] focus:border-primary"
              />
            </div>

            {error && (
              <p className="text-destructive text-farmer-sm font-semibold">
                ⚠️ {error}
              </p>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-lg py-5 text-farmer-lg font-bold active:scale-95 transition-transform touch-manipulation disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {t("login_verify")} <ShieldCheck className="w-6 h-6" />
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
