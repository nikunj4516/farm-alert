import { ChangeEvent, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  ImageUp,
  Languages,
  Loader2,
  LogOut,
  MapPin,
  Pencil,
  Phone,
  Sprout,
  Tractor,
  User,
  Wheat,
} from "lucide-react";
import FarmerEmojiImage from "@/components/FarmerEmojiImage";
import { Language, languageNames, useLanguage } from "@/contexts/LanguageContext";
import { Profile } from "@/services/profileService";

type ProfileCardProps = {
  profile?: Profile | null;
  isLoading?: boolean;
  error?: unknown;
  fallbackImageUrl?: string | null;
  onEdit: () => void;
  onLogout: () => void;
  onImageUpload: (file: File) => Promise<string | void>;
};

type ProfileExtra = Profile & {
  avatar_url?: string | null;
  profile_image?: string | null;
  profile_image_url?: string | null;
  image_url?: string | null;
  taluka?: string | null;
  crop_name?: string | null;
  farming_type?: string | null;
  farm_type?: string | null;
};

const profileCopy = {
  en: {
    title: "Farmer Profile",
    subtitle: "Your saved farm details",
    edit: "Edit Profile",
    logout: "Logout",
    changePhoto: "Change profile photo",
    uploadingPhoto: "Uploading photo",
    loading: "Loading your profile",
    unavailable: "We could not load profile details right now.",
    fullName: "Full Name",
    village: "Village",
    taluka: "Taluka",
    district: "District",
    state: "State",
    language: "Preferred Language",
    farmingType: "Farming Type",
    cropName: "Crop Name",
    phone: "Phone Number",
    notAdded: "Not added yet",
    farmer: "FarmAlert Farmer",
    gujarat: "Gujarat",
    mixedFarming: "Mixed farming",
  },
  hi: {
    title: "किसान प्रोफ़ाइल",
    subtitle: "आपकी सेव की गई खेती जानकारी",
    edit: "प्रोफ़ाइल बदलें",
    logout: "लॉगआउट",
    changePhoto: "प्रोफ़ाइल फोटो बदलें",
    uploadingPhoto: "फोटो अपलोड हो रही है",
    loading: "प्रोफ़ाइल लोड हो रही है",
    unavailable: "अभी प्रोफ़ाइल जानकारी लोड नहीं हो सकी।",
    fullName: "पूरा नाम",
    village: "गाँव",
    taluka: "तालुका",
    district: "जिला",
    state: "राज्य",
    language: "पसंदीदा भाषा",
    farmingType: "खेती का प्रकार",
    cropName: "फसल का नाम",
    phone: "मोबाइल नंबर",
    notAdded: "अभी नहीं जोड़ा गया",
    farmer: "FarmAlert किसान",
    gujarat: "गुजरात",
    mixedFarming: "मिश्रित खेती",
  },
  gu: {
    title: "ખેડૂત પ્રોફાઇલ",
    subtitle: "તમારી સેવ કરેલી ખેતી માહિતી",
    edit: "પ્રોફાઇલ બદલો",
    logout: "લોગઆઉટ",
    changePhoto: "પ્રોફાઇલ ફોટો બદલો",
    uploadingPhoto: "ફોટો અપલોડ થઈ રહ્યો છે",
    loading: "પ્રોફાઇલ લોડ થઈ રહી છે",
    unavailable: "હાલ પ્રોફાઇલ માહિતી લોડ થઈ શકી નથી.",
    fullName: "પૂરું નામ",
    village: "ગામ",
    taluka: "તાલુકો",
    district: "જિલ્લો",
    state: "રાજ્ય",
    language: "પસંદીદા ભાષા",
    farmingType: "ખેતીનો પ્રકાર",
    cropName: "પાકનું નામ",
    phone: "મોબાઈલ નંબર",
    notAdded: "હજી ઉમેર્યું નથી",
    farmer: "FarmAlert ખેડૂત",
    gujarat: "ગુજરાત",
    mixedFarming: "મિશ્ર ખેતી",
  },
} as const;

const readExtra = (profile: Profile | null | undefined, keys: Array<keyof ProfileExtra>) => {
  const extra = profile as ProfileExtra | null | undefined;
  return keys.map((key) => extra?.[key]).find((value) => typeof value === "string" && value.trim()) as
    | string
    | undefined;
};

const formatPhone = (phone?: string | null) => {
  if (!phone) return "";
  return phone.startsWith("+91") ? phone.replace("+91", "+91 ") : phone;
};

const ProfileCard = ({
  profile,
  isLoading,
  error,
  fallbackImageUrl,
  onEdit,
  onLogout,
  onImageUpload,
}: ProfileCardProps) => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const copy = profileCopy[language];
  const savedAvatarUrl = readExtra(profile, ["profile_image_url", "profile_image", "avatar_url", "image_url"]) || fallbackImageUrl;
  const avatarUrl = previewUrl || savedAvatarUrl;
  const displayName = profile?.name || copy.farmer;
  const preferredLanguage = (profile?.preferred_language || language) as Language;
  const taluka = readExtra(profile, ["taluka"]);
  const cropName = readExtra(profile, ["crop_name"]) || profile?.crop_type || copy.notAdded;
  const farmingType =
    readExtra(profile, ["farming_type", "farm_type"]) ||
    (profile?.land_size ? `${profile.land_size} acre farm` : copy.mixedFarming);

  const fields = [
    { label: copy.fullName, value: displayName, icon: User },
    { label: copy.taluka, value: taluka || copy.notAdded, icon: MapPin },
    { label: copy.district, value: profile?.district || copy.notAdded, icon: MapPin },
    { label: copy.state, value: profile?.state || copy.gujarat, icon: MapPin },
    { label: copy.village, value: profile?.village || copy.notAdded, icon: MapPin },
    {
      label: copy.language,
      value: languageNames[preferredLanguage] || preferredLanguage || copy.notAdded,
      icon: Languages,
    },
    { label: copy.farmingType, value: farmingType, icon: Tractor },
    { label: copy.cropName, value: cropName, icon: Wheat },
    { label: copy.phone, value: formatPhone(profile?.phone) || copy.notAdded, icon: Phone },
  ];

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploadError("");
    setIsUploadingImage(true);
    try {
      const uploadedUrl = await onImageUpload(file);
      if (uploadedUrl) setPreviewUrl(uploadedUrl);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : copy.unavailable);
      setPreviewUrl(null);
      throw error;
    } finally {
      setIsUploadingImage(false);
      window.setTimeout(() => URL.revokeObjectURL(localPreview), 1500);
    }
  };

  if (isLoading) {
    return (
      <section className="min-h-[360px] rounded-3xl border border-primary/10 bg-card p-6 shadow-card flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className="mt-4 text-sm font-semibold text-muted-foreground">{copy.loading}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="overflow-hidden rounded-3xl border border-primary/10 bg-card shadow-card">
        <div className="bg-primary px-5 pb-16 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary-foreground/75">{copy.subtitle}</p>
              <h2 className="mt-1 text-2xl font-bold text-primary-foreground">{copy.title}</h2>
            </div>
            <div className="rounded-2xl bg-primary-foreground/15 p-3">
              <Sprout className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        </div>

        <div className="-mt-12 px-5 pb-5">
          <div className="flex flex-col items-center text-center">
            <div className="relative h-24 w-24 rounded-full border-4 border-card bg-primary/10 shadow-elevated">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-full w-full rounded-full object-cover" />
              ) : (
                <FarmerEmojiImage className="h-full w-full rounded-full" />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                aria-label={copy.changePhoto}
                title={copy.changePhoto}
                className="absolute bottom-0 right-0 rounded-full border-2 border-card bg-primary p-1.5 text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-70"
              >
                {isUploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </div>
            <h3 className="mt-3 text-xl font-bold text-foreground">{displayName}</h3>
            {isUploadingImage && <p className="mt-1 text-xs font-semibold text-primary">{copy.uploadingPhoto}</p>}
            <div className="mt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isUploadingImage}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary disabled:opacity-60"
              >
                <Camera className="h-3.5 w-3.5" />
                {language === "gu" ? "કેમેરા" : language === "hi" ? "कैमरा" : "Camera"}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary disabled:opacity-60"
              >
                <ImageUp className="h-3.5 w-3.5" />
                {language === "gu" ? "ગેલેરી" : language === "hi" ? "गैलरी" : "Gallery"}
              </button>
            </div>
            {uploadError && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 text-xs font-bold text-destructive underline"
              >
                {uploadError}
              </button>
            )}
            <p className="text-sm font-medium text-muted-foreground">
              {[profile?.village, taluka, profile?.district, profile?.state || copy.gujarat].filter(Boolean).join(", ") ||
                copy.notAdded}
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{copy.unavailable}</span>
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <div
                  key={field.label}
                  className="rounded-2xl border border-border bg-background/70 p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {field.label}
                      </p>
                      <p className="mt-1 break-words text-sm font-bold text-foreground">{field.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all active:scale-[0.97] touch-manipulation"
        >
          <Pencil className="h-5 w-5" />
          {copy.edit}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-base font-semibold text-foreground transition-all active:scale-[0.97] touch-manipulation"
        >
          <LogOut className="h-5 w-5" />
          {copy.logout}
        </button>
      </div>
    </section>
  );
};

export default ProfileCard;
