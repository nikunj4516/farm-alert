import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setError("કૃપા કરીને 10 અંકનો મોબાઈલ નંબર નાખો");
      return;
    }
    setStep("otp");
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setError("કૃપા કરીને 6 અંકનો OTP નાખો");
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
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-farmer-2xl font-extrabold text-primary">
            🌾 FarmAlert
          </h1>
          <p className="text-farmer-base text-muted-foreground mt-2">
            હવામાન ચેતવણી • ખેતી ટિપ્સ • સમાચાર
          </p>
        </div>

        {step === "phone" ? (
          <div className="space-y-5">
            <div>
              <label className="text-farmer-base font-semibold text-foreground block mb-2">
                📱 મોબાઈલ નંબર
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
              OTP મોકલો <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0" />
              <p className="text-farmer-sm text-foreground">
                <strong>+91 {phone}</strong> પર OTP મોકલ્યો છે
              </p>
            </div>

            <div>
              <label className="text-farmer-base font-semibold text-foreground block mb-2">
                🔑 OTP નંબર
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
                  ચકાસો <ShieldCheck className="w-6 h-6" />
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
              ← નંબર બદલો
            </button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          🔒 તમારો નંબર સુરક્ષિત છે
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
