import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, ShieldAlert, Phone, AlertTriangle, Key } from "lucide-react";
import logoWide from "@/assets/farmalert-logo-wide.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

const getAuthErrorMessage = (message: string) => {
  const normalized = message.toLowerCase();
  if (normalized.includes("unsupported phone provider")) {
    return "Phone OTP is not enabled. Please configure an SMS provider in Supabase.";
  }
  if (normalized.includes("invalid phone")) {
    return "Please enter a valid 10-digit mobile number.";
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

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!authLoading && user && (role === "admin" || role === "super_admin")) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const formattedPhone = `+91${phone}`;

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
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
    toast({
      title: "OTP Sent Successfully",
      description: "An SMS code has been sent to your administrator phone number.",
    });
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    setLoading(true);
    setError("");

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

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();
        
        if (profile?.role) {
          const dbRole = profile.role.toLowerCase();
          if (dbRole === "admin" || dbRole === "super_admin") {
            setLoading(false);
            window.location.href = "/admin/dashboard";
            return;
          }
        }
      }
    } catch (err) {
      console.error("Error verifying admin role:", err);
    }

    setLoading(false);
    setError("Access Denied: This account is not registered as an administrator.");
    await supabase.auth.signOut();
  };

  const handleBypassAdminLogin = () => {
    setLoading(true);
    setError("");
    try {
      const targetUserId = 'test-user-id';
      const payload = {
        exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 365,
        sub: targetUserId,
        email: 'admin@example.com',
        phone: '+919999999999',
        app_metadata: { provider: 'phone', providers: ['phone'] },
        user_metadata: {
          name: 'FarmAlert Super Admin',
          phone: '9999999999',
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
          email: 'admin@example.com',
          phone: '+919999999999',
          user_metadata: {
            name: 'FarmAlert Super Admin',
            phone: '9999999999',
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
        console.warn("Error parsing URL:", e);
      }
      
      localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(fakeSession));
      window.location.href = '/admin/dashboard';
    } catch (err) {
      console.error(err);
      setError("Failed to create test admin session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-5 text-slate-100">
      <div className="w-full max-w-[400px] space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-2">
            <img src={logoWide} alt="FarmAlert" className="h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center justify-center gap-2">
              <ShieldAlert className="h-5 w-5 text-emerald-500" />
              Admin Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Enter your credentials to manage the FarmAlert platform.
            </p>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-950/40 border border-red-900/50 p-3 text-xs font-semibold text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {step === "phone" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm font-semibold">
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter Indian mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl py-3 pl-12 pr-4 text-sm font-semibold outline-none transition-all placeholder:text-slate-600 text-slate-200"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-emerald-950/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send OTP Verification
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Verification Code (OTP)
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold tracking-widest outline-none transition-all placeholder:text-slate-600 text-slate-200 placeholder:tracking-normal"
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 pt-1">
                  <span>Sent code to +91 {phone}</span>
                  <button
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                    }}
                    className="text-emerald-500 hover:underline"
                  >
                    Change Number
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-emerald-950/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Verify & Authenticate
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Developer Bypass
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={handleBypassAdminLogin}
            disabled={loading}
            className="w-full border border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-950/15 hover:bg-emerald-950/35 text-emerald-400 rounded-xl py-3 text-xs font-bold active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Access Sandbox Admin Portal"
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <a
            href="/login"
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-bold underline"
          >
            Switch to Farmer Portal Login
          </a>
        </div>
      </div>
    </div>
  );
};
