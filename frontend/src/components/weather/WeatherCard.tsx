import { WeatherReport } from "@/services/weatherService";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocationLabel, getDistrictLabel } from "@/services/gujaratLocationService";
import { Lock, ArrowRight, ShieldCheck, AlertTriangle, AlertOctagon, Sparkles } from "lucide-react";
import PremiumLockOverlay from "@/components/ui/PremiumLockOverlay";

interface WeatherCardProps {
  weather: WeatherReport;
  isPremium?: boolean;
}

const conditionIconMap: Record<string, string> = {
  "clear sky": "☀️",
  "partly cloudy": "⛅",
  "cloudy": "☁️",
  "overcast": "☁️",
  "fog": "🌫️",
  "drizzle": "🌧️",
  "rain": "🌧️",
  "thunderstorm": "⛈️",
};

const getConditionIcon = (condition?: string | null) => {
  const normalized = (condition || "").toLowerCase();
  return conditionIconMap[normalized] || "🌦️";
};

const copyText = {
  en: {
    lastUpdated: "Updated",
    rainProb: "Rain Probability",
    recommendationTitle: "AI Farming Recommendation",
    lockedTitle: "AI Weather Intelligence Locked",
    lockedDesc: "Upgrade to Premium to unlock village-level coordinates and smart farming recommendations.",
    freeLabel: "Free Plan (District Forecast)",
    villageLabel: "Village Accuracy",
    talukaLocked: "🔒 Taluka Locked",
    villageLocked: "🔒 Village Locked",
  },
  gu: {
    lastUpdated: "અપડેટ",
    rainProb: "વરસાદની શક્યતા",
    recommendationTitle: "AI કૃષિ ભલામણ",
    lockedTitle: "AI હવામાન સલાહ લોક છે",
    lockedDesc: "ગામ-સ્તરની સચોટ હવામાન માહિતી અને સ્માર્ટ કૃષિ ભલામણો મેળવવા પ્રીમિયમ પર અપગ્રેડ કરો.",
    freeLabel: "ફ્રી પ્લાન (જિલ્લાની આગાહી)",
    villageLabel: "ગામ સ્તરે સચોટ",
    talukaLocked: "🔒 તાલુકો લોક છે",
    villageLocked: "🔒 ગામ લોક છે",
  },
  hi: {
    lastUpdated: "अपडेट किया गया",
    rainProb: "बारिश की संभावना",
    recommendationTitle: "AI कृषि सलाह",
    lockedTitle: "AI मौसम सलाह लॉक है",
    lockedDesc: "गांव-स्तरीय सटीक मौसम और कृषि सलाह अनलॉक करने के लिए प्रीमियम में अपग्रेड करें.",
    freeLabel: "फ्री प्लान (जिला पूर्वानुमान)",
    villageLabel: "गांव स्तरीय सटीक",
    talukaLocked: "🔒 तालुका लॉक है",
    villageLocked: "🔒 गांव लॉक है",
  },
};

export const WeatherCard = ({ weather, isPremium = false }: WeatherCardProps) => {
  const { language, t } = useLanguage();
  const copy = copyText[language] || copyText.en;

  // Resolve Names
  const villageName = weather.location?.split(",")?.[0]?.trim() || weather.village || "";
  const talukaName = weather.location?.split(",")?.[1]?.trim() || weather.taluka || "";
  const districtName = weather.district || "";

  const displayDistrict = districtName ? getDistrictLabel(districtName, language) : "";
  const displayTaluka = talukaName ? getLocationLabel(talukaName, language) : "";
  const displayVillage = villageName ? getLocationLabel(villageName, language) : "";

  // Last Updated format
  const locale = language === "hi" ? "hi-IN" : language === "gu" ? "gu-IN" : "en-IN";
  const lastUpdatedTime = weather.fetched_at 
    ? new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(new Date(weather.fetched_at)) 
    : "";

  // Risk Level Assessment
  const dangerScore = weather.dangerAssessment?.dangerScore ?? 0;
  let riskLabel = "SAFE";
  let riskColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  let RiskIcon = ShieldCheck;

  if (dangerScore >= 90) {
    riskLabel = "EXTREME RISK";
    riskColor = "bg-red-500/20 text-red-600 border-red-500/30 animate-pulse";
    RiskIcon = AlertOctagon;
  } else if (dangerScore >= 75) {
    riskLabel = "HIGH RISK";
    riskColor = "bg-orange-500/15 text-orange-600 border-orange-500/25";
    RiskIcon = AlertOctagon;
  } else if (dangerScore >= 45) {
    riskLabel = "CAUTION";
    riskColor = "bg-amber-500/15 text-amber-600 border-amber-500/25";
    RiskIcon = AlertTriangle;
  }

  // Get first dynamic recommendation
  const primaryRec = weather.recommendations?.[0]?.message || 
    (language === "gu" ? "દવા છંટકાવ અને પિયત માટે હવામાન અનુકૂળ છે." : language === "hi" ? "दवा छिड़काव और सिंचाई के लिए मौसम अनुकूल है।" : "Conditions are favorable for pesticide spraying and irrigation.");

  return (
    <div className="space-y-4">
      {/* Main Weather Card (Glassmorphic, Fitness App Style) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-lg border border-white/10 transition-all duration-300 hover:shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />

        {/* Location Row */}
        <div className="flex flex-col gap-1.5 border-b border-white/10 pb-4 mb-4">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>{getLocationLabel("Gujarat", language)}</span>
            <span>•</span>
            <span>{displayDistrict}</span>
            <span>•</span>
            {isPremium ? (
              <span>{displayTaluka}</span>
            ) : (
              <span className="text-amber-400/80 font-black">{copy.talukaLocked}</span>
            )}
          </div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
              {isPremium ? (
                displayVillage || "Village Weather"
              ) : (
                <span className="text-amber-400/95 font-extrabold">{copy.villageLocked}</span>
              )}
            </h2>
            <span className="text-[10px] font-black uppercase bg-white/10 px-2 py-0.5 rounded border border-white/5 text-slate-300">
              {isPremium ? copy.villageLabel : copy.freeLabel}
            </span>
          </div>
        </div>

        {/* Temperature & Icon */}
        <div className="flex items-center justify-between gap-4 py-1">
          <div className="flex items-baseline gap-1">
            <h1 className="text-6xl font-black tracking-tighter leading-none text-white">
              {Math.round(weather.temperature ?? 28)}
            </h1>
            <span className="text-2xl font-black text-emerald-400">°C</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-5xl leading-none select-none filter drop-shadow-md" aria-hidden="true">
              {getConditionIcon(weather.weather_condition)}
            </span>
            <p className="mt-1.5 text-xs font-black text-slate-300 tracking-wide">
              {weather.weather_condition ? t(`weather.conditions.${weather.weather_condition}`) : "Clear Sky"}
            </p>
          </div>
        </div>

        {/* Bottom Details Row (Rain Probability, Risk Level, Updated At) */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
          {/* Rain Prob */}
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{copy.rainProb}</p>
            <p className="text-sm font-black text-white mt-0.5">
              {Math.round(weather.precipitation_probability ?? 0)}%
            </p>
          </div>

          {/* Risk Level badge */}
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-black ${riskColor}`}>
            <RiskIcon className="w-3.5 h-3.5" />
            <span>{riskLabel}</span>
          </div>

          {/* Updated At */}
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{copy.lastUpdated}</p>
            <p className="text-sm font-black text-slate-200 mt-0.5">{lastUpdatedTime}</p>
          </div>
        </div>
      </section>

      {/* AI Recommendation Card (Directly Below) */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm min-h-[120px] flex flex-col justify-center">
        {!isPremium ? (
          <>
            <div className="space-y-2.5 opacity-20 blur-[1px] select-none">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">{copy.recommendationTitle}</p>
              </div>
              <p className="text-xs font-bold leading-relaxed text-slate-800">{primaryRec}</p>
            </div>
            <PremiumLockOverlay
              requiredTier="premium"
              title={copy.lockedTitle}
              description={copy.lockedDesc}
            />
          </>
        ) : (
          <div className="space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                {copy.recommendationTitle}
              </p>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-slate-800 pl-8 border-l-2 border-emerald-500/30">
              {primaryRec}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default WeatherCard;
