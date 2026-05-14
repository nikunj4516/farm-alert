import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Check, ArrowRight, ArrowLeft, User, MapPin, Wheat, Bean, Cloud, Sprout, Trees, Carrot, Package } from "lucide-react";
import FarmerEmojiImage from "@/components/FarmerEmojiImage";
import farmerAvatar from "@/assets/farmer-1.png";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

const STEPS = 3;

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, tArray } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    village: "",
    district: "",
    crop_type: "",
    land_size: "",
  });

  const crops = tArray("crops");
  const cropIconsList = [
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Sheaf%20of%20Rice.png" alt="wheat" className="w-5 h-5 drop-shadow-sm" key="wheat" />,
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Seedling.png" alt="sprout" className="w-5 h-5 drop-shadow-sm" key="sprout" />,
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud.png" alt="cloud" className="w-5 h-5 drop-shadow-sm" key="cloud" />,
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Ear%20of%20Corn.png" alt="bean" className="w-5 h-5 drop-shadow-sm" key="bean" />,
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Deciduous%20Tree.png" alt="trees" className="w-5 h-5 drop-shadow-sm" key="trees" />,
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Carrot.png" alt="carrot" className="w-5 h-5 drop-shadow-sm" key="carrot" />,
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Package.png" alt="package" className="w-5 h-5 drop-shadow-sm" key="package" />
  ];

  const stepLabels = [
    { label: t("profile_step_personal"), icon: farmerAvatar },
    { label: t("profile_step_location"), icon: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Round%20Pushpin.png" },
    { label: t("profile_step_farming"), icon: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Sheaf%20of%20Rice.png" },
  ];

  const handleSave = async () => {
    if (!form.name.trim()) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    const landSize = Number.parseFloat(form.land_size);
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          name: form.name.trim().substring(0, 100),
          village: form.village.trim().substring(0, 100) || null,
          district: form.district.trim().substring(0, 100) || null,
          crop_type: form.crop_type || null,
          land_size: Number.isFinite(landSize) ? landSize : null,
        },
        { onConflict: "user_id" }
      );

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/subscription");
  };

  const canGoNext = () => {
    if (step === 0) return form.name.trim().length > 0;
    return true;
  };

  const progress = ((step + 1) / STEPS) * 100;

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="max-w-[400px] mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <FarmerEmojiImage className="mx-auto h-16 w-16" />
          <h1 className="text-2xl font-bold text-foreground">
            {t("profile_title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("profile_subtitle")}
          </p>
        </div>

        {/* Stepper */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {stepLabels.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isDone ? "bg-primary text-primary-foreground" :
                    isActive ? "bg-primary text-primary-foreground shadow-elevated" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {isDone ? <Check className="w-5 h-5" /> : <img src={s.icon} alt={s.label} className="w-5 h-5 drop-shadow-sm object-cover rounded-full" />}
                  </div>
                  <span className={`text-xs font-semibold ${isActive || isDone ? "text-primary" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2 bg-muted" />
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border space-y-4 min-h-[240px]">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
                  <img src={farmerAvatar} alt="user" className="w-5 h-5 drop-shadow-sm object-cover rounded-full" />
                  {t("profile_name")}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t("profile_name_placeholder")}
                  className="w-full text-base text-foreground py-3.5 px-4 border-2 border-border rounded-xl bg-background outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
                  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Round%20Pushpin.png" alt="location" className="w-5 h-5 drop-shadow-sm" />
                  {t("profile_village")}
                </label>
                <input
                  type="text"
                  value={form.village}
                  onChange={(e) => setForm({ ...form, village: e.target.value })}
                  placeholder={t("profile_village_placeholder")}
                  className="w-full text-base text-foreground py-3.5 px-4 border-2 border-border rounded-xl bg-background outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
                  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Round%20Pushpin.png" alt="location" className="w-5 h-5 drop-shadow-sm" />
                  {t("profile_district")}
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  placeholder={t("profile_district_placeholder")}
                  className="w-full text-base text-foreground py-3.5 px-4 border-2 border-border rounded-xl bg-background outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
                  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Sheaf%20of%20Rice.png" alt="wheat" className="w-5 h-5 drop-shadow-sm" /> {t("profile_crop")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {crops.map((crop, i) => (
                    <button
                      key={crop}
                      onClick={() => setForm({ ...form, crop_type: crop })}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold border-2 transition-all touch-manipulation flex items-center gap-2 ${
                        form.crop_type === crop
                          ? "bg-primary text-primary-foreground border-primary shadow-soft"
                          : "bg-background text-foreground border-border hover:border-primary/30"
                      }`}
                    >
                      <span>{cropIconsList[i]}</span>
                      {crop}
                      {form.crop_type === crop && <Check className="w-4 h-4 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
                  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Round%20Pushpin.png" alt="location" className="w-5 h-5 drop-shadow-sm" /> {t("profile_land")}
                </label>
                <input
                  type="tel"
                  inputMode="decimal"
                  value={form.land_size}
                  onChange={(e) => setForm({ ...form, land_size: e.target.value })}
                  placeholder={t("profile_land_placeholder")}
                  className="w-full text-base text-foreground py-3.5 px-4 border-2 border-border rounded-xl bg-background outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center justify-center gap-2 bg-muted text-foreground rounded-xl py-3.5 px-6 text-base font-semibold active:scale-[0.97] transition-transform touch-manipulation"
            >
              <ArrowLeft className="w-5 h-5" />
              {t("profile_back")}
            </button>
          )}
          {step < STEPS - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext()}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 text-base font-semibold active:scale-[0.97] transition-transform touch-manipulation disabled:opacity-40 shadow-md"
            >
              {t("profile_next")} <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading || !form.name.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 text-base font-semibold active:scale-[0.97] transition-transform touch-manipulation disabled:opacity-40 shadow-md"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {t("profile_save")} <Check className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <p className="text-destructive text-sm font-semibold text-center">
            {error}
          </p>
        )}

        <button
          onClick={() => { navigate("/subscription"); }}
          className="w-full text-center text-sm text-muted-foreground font-semibold py-2 touch-manipulation"
        >
          {t("profile_skip")}
        </button>
      </div>
    </div>
  );
};

export default ProfileSetup;
