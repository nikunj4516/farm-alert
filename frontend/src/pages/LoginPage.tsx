import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck, Phone, AlertTriangle, Key } from "lucide-react";
import FarmerEmojiImage from "@/components/FarmerEmojiImage";
import logoWide from "@/assets/farmalert-logo-wide.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { hasActiveSubscription } from "@/services/subscriptionService";
import { ProfileService } from "@/services/profileService";


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

const encodeJwt = (payload: any) => {
  const header = { alg: "HS256", typ: "JWT" };
  const base64Url = (obj: any) => {
    const str = JSON.stringify(obj);
    if (typeof window !== "undefined" && typeof btoa === "function") {
      return btoa(unescape(encodeURIComponent(str)))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    }
    return Buffer.from(str)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };
  return `${base64Url(header)}.${base64Url(payload)}.signature`;
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
  const { user, role, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      if (role === "admin" || role === "super_admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/home";
      }
    }
  }, [user, role, authLoading]);

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

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      });

      if (error) {
        setLoading(false);
        setError(getAuthErrorMessage(error.message));
        return;
      }
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError(err.message || "An error occurred during verification.");
      setLoading(false);
    }
  };

  const handleBypassLogin = (targetRole: "farmer" | "admin") => {
    setLoading(true);
    setError("");
    try {
      const isFarmer = targetRole === "farmer";
      const targetUserId = isFarmer ? 'test-farmer-id' : 'test-user-id';
      
      const payload = {
        exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 365,
        sub: targetUserId,
        email: isFarmer ? 'farmer@example.com' : 'admin@example.com',
        phone: isFarmer ? '+919999900000' : '+919999999999',
        app_metadata: { provider: 'phone', providers: ['phone'] },
        user_metadata: {
          name: isFarmer ? 'Test Farmer' : 'FarmAlert Super Admin',
          phone: isFarmer ? '9999900000' : '9999999999',
        },
        role: 'authenticated',
        aal: 'aal1',
        amr: [{ method: 'otp', timestamp: Math.floor(Date.now() / 1000) }]
      };
      
      const token = encodeJwt(payload);

      const fakeSession = {
        access_token: token,
        token_type: 'bearer',
        expires_in: 3600 * 24 * 365,
        refresh_token: 'fake-refresh-dev',
        user: {
          id: targetUserId,
          email: isFarmer ? 'farmer@example.com' : 'admin@example.com',
          phone: isFarmer ? '+919999900000' : '+919999999999',
          user_metadata: {
            name: isFarmer ? 'Test Farmer' : 'FarmAlert Super Admin',
            phone: isFarmer ? '9999900000' : '9999999999',
          },
          app_metadata: { provider: 'phone', providers: ['phone'] },
          aud: 'authenticated',
          role: 'authenticated'
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 365
      };
      
      let ref = "jipmjrgsqhjknbtkjhel";
      try {
        const url = import.meta.env.VITE_SUPABASE_URL || "";
        const match = url.match(/https:\/\/([^.]+)\.supabase\.(co|net)/);
        if (match) ref = match[1];
      } catch (e) {
        console.warn("Error parsing Supabase URL:", e);
      }
      
      localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(fakeSession));
      
      if (isFarmer) {
        localStorage.setItem('farmalert_profile_completed', 'true');
        localStorage.setItem('farmalert_language_selected', 'true');
        
        const mockProfile = {
          id: 'local-profile-test-farmer-id',
          user_id: 'test-farmer-id',
          name: 'Test Farmer',
          phone: '9999900000',
          village: 'Rampura',
          taluka: 'Jambughoda',
          district: 'Panchmahal',
          state: 'Gujarat',
          crop_type: 'Wheat',
          land_size: 5,
          preferred_language: 'gu',
          profile_completed: true,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profile_image_url: null,
          latitude: null,
          longitude: null,
          role: 'farmer'
        };
        localStorage.setItem('farmalert_local_profile_test-farmer-id', JSON.stringify(mockProfile));
        
        localStorage.setItem('farmalert_subscription_active', 'true');
        localStorage.setItem('farmalert_subscription_tier', 'premium');
        localStorage.setItem('farmalert_subscription_checked_at', String(Date.now()));
        
        window.location.href = '/home';
      } else {
        window.location.href = '/admin/dashboard';
      }
    } catch (err) {
      console.error(err);
      setError("Failed to create test session");
    } finally {
      setLoading(false);
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
                <span className="text-lg leading-none" aria-hidden="true">📞</span>
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
                <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Warning.png" alt="error" className="w-4 h-4 drop-shadow-sm" /> {error}
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
              <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shield.png" alt="secure" className="w-6 h-6 drop-shadow-sm flex-shrink-0" />
              <p className="text-sm text-foreground">
                <strong>+91 {phone}</strong>{" "}
                {t("login_otp_sent")}
              </p>
            </div>

            <div className="bg-card rounded-2xl p-5 shadow-card border border-border space-y-4">
              <label className="text-base font-semibold text-foreground flex items-center gap-2">
                <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Key.png" alt="otp" className="w-5 h-5 drop-shadow-sm" /> {t("login_otp_label")}
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
                <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Warning.png" alt="error" className="w-4 h-4 drop-shadow-sm" /> {error}
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
                  {t("login_verify")} <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shield.png" alt="verify" className="w-5 h-5 drop-shadow-sm" />
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

        <div className="pt-4 border-t border-dashed border-border mt-4 space-y-2">
          <div className="text-center text-[10px] text-muted-foreground font-semibold tracking-wider uppercase mb-1">
            Developer Sandbox
          </div>
          <button
            type="button"
            onClick={() => handleBypassLogin("farmer")}
            className="w-full py-2.5 px-3 rounded-xl border border-emerald-600/30 bg-emerald-50/20 text-emerald-800 text-xs font-bold hover:bg-emerald-100/40 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>👨‍🌾</span> Farmer Demo
          </button>
        </div>

        <div className="text-center pt-2">
          <a
            href="/admin/login"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-bold underline"
          >
            Access Admin Portal
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
