import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, ArrowRight, ArrowLeft, User, MapPin, Wheat, Bean, Cloud, Sprout, Trees, Carrot, Package } from "lucide-react";
import FarmerEmojiImage from "@/components/FarmerEmojiImage";
import farmerAvatar from "@/assets/farmer-1.png";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { ProfileService } from "@/services/profileService";
import {
  GUJARAT_DISTRICTS,
  getTalukasForDistrict,
  getVillagesForTaluka,
  getSavedSelectedLocation,
  saveSelectedLocation,
  validateGujaratLocation,
} from "@/services/gujaratLocationService";

const STEPS = 3;
const locationCopy = {
  en: {
    village: "Village",
    villagePlaceholder: "e.g. Rampura",
    taluka: "Taluka",
    talukaPlaceholder: "e.g. Jambughoda",
    district: "District",
    districtPlaceholder: "e.g. Panchmahal",
    state: "State",
    statePlaceholder: "e.g. Gujarat",
    requiredLocation: "Select district, taluka, and village.",
    requiredFarm: "Select crop and enter farm size.",
  },
  hi: {
    village: "गाँव",
    villagePlaceholder: "जैसे रामपुरा",
    taluka: "तालुका",
    talukaPlaceholder: "जैसे जांबुघोड़ा",
    district: "जिला",
    districtPlaceholder: "जैसे पंचमहल",
    state: "राज्य",
    statePlaceholder: "जैसे गुजरात",
    requiredLocation: "जिला, तालुका और गाँव चुनें.",
    requiredFarm: "फसल चुनें और खेत का आकार दर्ज करें.",
  },
  gu: {
    village: "ગામ",
    villagePlaceholder: "દા.ત. રામપુરા",
    taluka: "તાલુકો",
    talukaPlaceholder: "દા.ત. જાંબુઘોડા",
    district: "જિલ્લો",
    districtPlaceholder: "દા.ત. પંચમહાલ",
    state: "રાજ્ય",
    statePlaceholder: "દા.ત. ગુજરાત",
    requiredLocation: "જિલ્લો, તાલુકો અને ગામ પસંદ કરો.",
    requiredFarm: "પાક પસંદ કરો અને જમીનનું ક્ષેત્રફળ લખો.",
  },
} as const;

const ProfileSetup = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { language, t, tArray } = useLanguage();
  const copy = locationCopy[language];
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    village: "",
    taluka: "",
    district: "",
    state: "Gujarat",
    crop_type: "",
    land_size: "",
  });

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const loadProfile = async () => {
      setProfileLoading(true);
      setError("");

      try {
        const savedProfile = await ProfileService.getProfile(user.id);
        if (!isMounted) return;
        const savedLocation = getSavedSelectedLocation();

        setForm({
          name: savedProfile?.name || "",
          village: savedProfile?.village || savedLocation?.village || "",
          taluka: (savedProfile as typeof savedProfile & { taluka?: string | null } | null)?.taluka || savedLocation?.taluka || "",
          district: savedProfile?.district || savedLocation?.district || "",
          state: "Gujarat",
          crop_type: savedProfile?.crop_type || "",
          land_size: savedProfile?.land_size ? String(savedProfile.land_size) : "",
        });
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : "Unable to load profile");
        }
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const crops = tArray("crops");
  const cropValues = ["Wheat", "Rice", "Cotton", "Groundnut", "Sugarcane", "Vegetables", "Other"];
  const talukaOptions = getTalukasForDistrict(form.district);
  const villageOptions = getVillagesForTaluka(form.district, form.taluka);
  const cropIconsList = [
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Sheaf%20of%20Rice.png" alt="wheat" className="w-5 h-5 drop-shadow-sm" key="wheat" />,
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Seedling.png" alt="sprout" className="w-5 h-5 drop-shadow-sm" key="sprout" />,
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud.png" alt="cloud" className="w-5 h-5 drop-shadow-sm" key="cloud" />,
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Ear%20of%20Corn.png" alt="bean" className="w-5 h-5 drop-shadow-sm" key="bean" />,
    <span className="text-xl leading-none" aria-hidden="true" key="sugarcane">🎋</span>,
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

    try {
      const landSize = Number.parseFloat(form.land_size);
      const validatedLocation = validateGujaratLocation(form);
      localStorage.setItem("farmalert_profile_completed", "true");
      localStorage.setItem("farmalert_onboarding_completed", "true");
      saveSelectedLocation(validatedLocation);
      await ProfileService.upsertProfile(user.id, {
        name: form.name.trim().substring(0, 100),
        village: validatedLocation.village,
        taluka: validatedLocation.taluka,
        district: validatedLocation.district,
        latitude: validatedLocation.latitude,
        longitude: validatedLocation.longitude,
        profile_completed: true,
        onboarding_completed: true,
        preferred_language: language,
        crop_type: form.crop_type || null,
        land_size: Number.isFinite(landSize) ? landSize : null,
      });
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast({
        title: t("profile_save"),
        description: t("profile_subtitle"),
      });
      navigate("/dashboard", { state: { activeTab: "profile" } });
    } catch (error) {
      setError(ProfileService.getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="rounded-3xl border border-primary/10 bg-card p-6 text-center shadow-card">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm font-semibold text-muted-foreground">{t("profile_subtitle")}</p>
        </div>
      </div>
    );
  }

  const canGoNext = () => {
    if (step === 0) return form.name.trim().length > 0;
    if (step === 1) return Boolean(form.district && form.taluka && form.village.trim());
    return Boolean(form.crop_type && Number.parseFloat(form.land_size) > 0);
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
                  <MapPin className="w-5 h-5 text-primary" />
                  {copy.state}
                </label>
                <div className="flex w-full items-center justify-between rounded-xl border-2 border-primary/15 bg-primary/5 px-4 py-3.5 text-base font-bold text-foreground">
                  <span>{language === "gu" ? "ગુજરાત" : language === "hi" ? "गुजरात" : "Gujarat"}</span>
                  <Check className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
              </div>
              <div>
                <label className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
                  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Round%20Pushpin.png" alt="location" className="w-5 h-5 drop-shadow-sm" />
                  {copy.district}
                </label>
                <select
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value, taluka: "", village: "" })}
                  className="w-full text-base text-foreground py-3.5 px-4 border-2 border-border rounded-xl bg-background outline-none focus:border-primary transition-colors"
                >
                  <option value="">{copy.districtPlaceholder}</option>
                  {GUJARAT_DISTRICTS.map((district) => (
                    <option key={district.name} value={district.name}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
                  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Round%20Pushpin.png" alt="location" className="w-5 h-5 drop-shadow-sm" />
                  {copy.taluka}
                </label>
                <select
                  value={form.taluka}
                  onChange={(e) => setForm({ ...form, taluka: e.target.value, village: "" })}
                  disabled={!form.district}
                  className="w-full text-base text-foreground py-3.5 px-4 border-2 border-border rounded-xl bg-background outline-none focus:border-primary transition-colors"
                >
                  <option value="">{copy.talukaPlaceholder}</option>
                  {talukaOptions.map((taluka) => (
                    <option key={taluka} value={taluka}>
                      {taluka}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
                  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Round%20Pushpin.png" alt="location" className="w-5 h-5 drop-shadow-sm" />
                  {copy.village}
                </label>
                <select
                  value={form.village}
                  onChange={(e) => setForm({ ...form, village: e.target.value })}
                  disabled={!form.taluka}
                  className="w-full text-base text-foreground py-3.5 px-4 border-2 border-border rounded-xl bg-background outline-none focus:border-primary transition-colors"
                >
                  <option value="">{copy.villagePlaceholder}</option>
                  {villageOptions.map((village) => (
                    <option key={village} value={village}>
                      {village}
                    </option>
                  ))}
                </select>
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
                      onClick={() => setForm({ ...form, crop_type: cropValues[i] })}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold border-2 transition-all touch-manipulation flex items-center gap-2 ${
                        form.crop_type === cropValues[i]
                          ? "bg-primary text-primary-foreground border-primary shadow-soft"
                          : "bg-background text-foreground border-border hover:border-primary/30"
                      }`}
                    >
                      <span>{cropIconsList[i]}</span>
                      {crop}
                      {form.crop_type === cropValues[i] && <Check className="w-4 h-4 ml-auto" />}
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
              disabled={loading || !canGoNext()}
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

        {!canGoNext() && step > 0 && (
          <p className="text-center text-xs font-semibold text-muted-foreground">
            {step === 1 ? copy.requiredLocation : copy.requiredFarm}
          </p>
        )}

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
