import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    village: "",
    district: "",
    crop_type: "",
    land_size: "",
  });

  const crops = ["ઘઉં", "ડાંગર", "કપાસ", "મગફળી", "શેરડી", "શાકભાજી", "અન્ય"];

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setLoading(true);

    await supabase
      .from("profiles")
      .update({
        name: form.name.trim(),
        village: form.village.trim() || null,
        district: form.district.trim() || null,
        crop_type: form.crop_type || null,
        land_size: form.land_size ? parseFloat(form.land_size) : null,
      })
      .eq("user_id", user?.id ?? "");

    setLoading(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="max-w-[400px] mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-farmer-xl font-extrabold text-primary">
            👨‍🌾 તમારી માહિતી
          </h1>
          <p className="text-farmer-sm text-muted-foreground mt-1">
            આ માહિતી તમને વધુ સારી ટિપ્સ આપવા માટે છે
          </p>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-farmer-base font-semibold text-foreground block mb-2">
              👤 તમારું નામ *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="દા.ત. રમેશભાઈ પટેલ"
              className="w-full text-farmer-base text-foreground py-4 px-4 border-2 border-border rounded-lg bg-card outline-none focus:border-primary"
            />
          </div>

          {/* Village */}
          <div>
            <label className="text-farmer-base font-semibold text-foreground block mb-2">
              🏘️ ગામ
            </label>
            <input
              type="text"
              value={form.village}
              onChange={(e) => setForm({ ...form, village: e.target.value })}
              placeholder="દા.ત. વડગામ"
              className="w-full text-farmer-base text-foreground py-4 px-4 border-2 border-border rounded-lg bg-card outline-none focus:border-primary"
            />
          </div>

          {/* District */}
          <div>
            <label className="text-farmer-base font-semibold text-foreground block mb-2">
              📍 જિલ્લો
            </label>
            <input
              type="text"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              placeholder="દા.ત. અમદાવાદ"
              className="w-full text-farmer-base text-foreground py-4 px-4 border-2 border-border rounded-lg bg-card outline-none focus:border-primary"
            />
          </div>

          {/* Crop Type */}
          <div>
            <label className="text-farmer-base font-semibold text-foreground block mb-2">
              🌾 મુખ્ય પાક
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

          {/* Land Size */}
          <div>
            <label className="text-farmer-base font-semibold text-foreground block mb-2">
              📐 જમીન (એકર)
            </label>
            <input
              type="tel"
              inputMode="decimal"
              value={form.land_size}
              onChange={(e) => setForm({ ...form, land_size: e.target.value })}
              placeholder="દા.ત. 5"
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
              સેવ કરો <Check className="w-6 h-6" />
            </>
          )}
        </button>

        <button
          onClick={() => navigate("/")}
          className="w-full text-center text-farmer-sm text-muted-foreground font-semibold py-3 touch-manipulation"
        >
          પછીથી ભરીશ →
        </button>
      </div>
    </div>
  );
};

export default ProfileSetup;
