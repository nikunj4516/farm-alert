import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { t, tArray } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    village: "",
    district: "",
    crop_type: "",
    land_size: "",
  });

  const crops = tArray("crops");

  const handleSave = () => {
    if (!form.name.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("farmalert_onboarded", "true");
      navigate("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="max-w-[400px] mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-farmer-xl font-extrabold text-primary">
            {t("profile_title")}
          </h1>
          <p className="text-farmer-sm text-muted-foreground mt-1">
            {t("profile_subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-farmer-base font-semibold text-foreground block mb-2">
              {t("profile_name")}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("profile_name_placeholder")}
              className="w-full text-farmer-base text-foreground py-4 px-4 border-2 border-border rounded-lg bg-card outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-farmer-base font-semibold text-foreground block mb-2">
              {t("profile_village")}
            </label>
            <input
              type="text"
              value={form.village}
              onChange={(e) => setForm({ ...form, village: e.target.value })}
              placeholder={t("profile_village_placeholder")}
              className="w-full text-farmer-base text-foreground py-4 px-4 border-2 border-border rounded-lg bg-card outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-farmer-base font-semibold text-foreground block mb-2">
              {t("profile_district")}
            </label>
            <input
              type="text"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              placeholder={t("profile_district_placeholder")}
              className="w-full text-farmer-base text-foreground py-4 px-4 border-2 border-border rounded-lg bg-card outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-farmer-base font-semibold text-foreground block mb-2">
              {t("profile_crop")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {crops.map((crop) => (
                <button
                  key={crop}
                  onClick={() => setForm({ ...form, crop_type: crop })}
                  className={`py-3 px-4 rounded-lg text-farmer-sm font-semibold border-2 transition-colors touch-manipulation ${
                    form.crop_type === crop
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border"
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-farmer-base font-semibold text-foreground block mb-2">
              {t("profile_land")}
            </label>
            <input
              type="tel"
              inputMode="decimal"
              value={form.land_size}
              onChange={(e) => setForm({ ...form, land_size: e.target.value })}
              placeholder={t("profile_land_placeholder")}
              className="w-full text-farmer-base text-foreground py-4 px-4 border-2 border-border rounded-lg bg-card outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading || !form.name.trim()}
          className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-lg py-5 text-farmer-lg font-bold active:scale-95 transition-transform touch-manipulation disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              {t("profile_save")} <Check className="w-6 h-6" />
            </>
          )}
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full text-center text-farmer-sm text-muted-foreground font-semibold py-3 touch-manipulation"
        >
          {t("profile_skip")}
        </button>
      </div>
    </div>
  );
};

export default ProfileSetup;
