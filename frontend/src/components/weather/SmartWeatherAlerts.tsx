import { useState } from "react";
import type { SmartAgricultureAlert } from "@/services/agricultureWeatherRules";
import { getCropWeatherThreshold } from "@/services/agricultureWeatherRules";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lock, Bell, AlertOctagon, ShieldAlert, CloudRain, Wind, Flame, Droplets, ShieldCheck, Bug } from "lucide-react";
import PremiumLockOverlay from "@/components/ui/PremiumLockOverlay";
import { PermissionService } from "@/services/permissionService";

interface SmartWeatherAlertsProps {
  alerts: SmartAgricultureAlert[];
  cropType?: string | null;
  isPremium?: boolean;
}

const priorityConfig = {
  low: { label: { en: "Low Priority", gu: "ઓછી અગ્રતા", hi: "कम प्राथमिकता" }, bg: "bg-green-100 text-green-800 border-green-200" },
  medium: { label: { en: "Medium Priority", gu: "મધ્યમ અગ્રતા", hi: "मध्यम प्राथमिकता" }, bg: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  high: { label: { en: "High Priority", gu: "ઉચ્ચ અગ્રતા", hi: "उच्च प्राथमिकता" }, bg: "bg-orange-100 text-orange-800 border-orange-200" },
  critical: { label: { en: "Critical Priority", gu: "કટોકટી અગ્રતા", hi: "गंभीर प्राथमिकता" }, bg: "bg-red-100 text-red-800 border-red-200 border-2 animate-pulse" },
};

const categoryTabs = [
  { id: "all", label: { en: "All", gu: "બધા", hi: "सभी" }, icon: <Bell className="w-3.5 h-3.5" /> },
  { id: "rain", label: { en: "Rain", gu: "વરસાદ", hi: "बारिश" }, icon: <CloudRain className="w-3.5 h-3.5" /> },
  { id: "wind", label: { en: "Wind", gu: "પવન", hi: "हवा" }, icon: <Wind className="w-3.5 h-3.5" /> },
  { id: "heat", label: { en: "Heat", gu: "ગરમી", hi: "गर्मी" }, icon: <Flame className="w-3.5 h-3.5" /> },
  { id: "humidity", label: { en: "Humidity", gu: "ભેજ", hi: "नमी" }, icon: <Droplets className="w-3.5 h-3.5" /> },
  { id: "crop", label: { en: "Crop Risk", gu: "પાક જોખમ", hi: "फसल जोखिम" }, icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { id: "disease", label: { en: "Disease Risk", gu: "રોગ જોખમ", hi: "रोग जोखिम" }, icon: <Bug className="w-3.5 h-3.5" /> },
];

const alertIcon = (type: string) => {
  if (type === "heatwave") return "🔥";
  if (type === "heavy_rain" || type === "rain") return "🌧️";
  if (type === "strong_wind") return "🌬️";
  if (type === "pest_risk" || type === "humidity") return "🛡️";
  if (type === "disease_risk") return "🐛";
  if (type === "frost") return "❄️";
  if (type === "uv_stress") return "☀️";
  if (type === "safe_weather") return "✅";
  return "⚠️";
};

const formatTemplate = (template: string, values: Record<string, string>) =>
  Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);

const SmartWeatherAlerts = ({ alerts, cropType }: SmartWeatherAlertsProps) => {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const isPremium = PermissionService.hasPermission("Advanced Alerts");
  const threshold = getCropWeatherThreshold(cropType);
  const crop = t(`weather.intelligence.crops.${threshold.cropName}`);

  const getPriority = (severity: string): "low" | "medium" | "high" | "critical" => {
    if (severity === "red") return "critical";
    if (severity === "orange") return "high";
    if (severity === "yellow") return "medium";
    return "low";
  };

  const alertTitle = (alert: SmartAgricultureAlert) => t(`weather.intelligence.alerts.${alert.type}.title`);
  const alertMessage = (alert: SmartAgricultureAlert) =>
    formatTemplate(t(`weather.intelligence.alerts.${alert.type}.message`), {
      crop,
      value: alert.metricValue,
    });
  const alertRecommendation = (alert: SmartAgricultureAlert) => t(`weather.intelligence.alerts.${alert.type}.recommendation`);

  // Filter alerts by selected category tab
  const filteredAlerts = alerts.filter((alert) => {
    if (activeCategory === "all") return true;
    const type = alert.type.toLowerCase();
    if (activeCategory === "rain") return type.includes("rain") || type.includes("precipitation");
    if (activeCategory === "wind") return type.includes("wind");
    if (activeCategory === "heat") return type.includes("heat") || type.includes("temp") || type.includes("hot");
    if (activeCategory === "humidity") return type.includes("humidity");
    if (activeCategory === "crop") return type.includes("pest") || type.includes("crop");
    if (activeCategory === "disease") return type.includes("disease");
    return true;
  });

  const criticalAlert = alerts.find((a) => a.severity === "red");

  const mockAlerts = [
    { type: "heavy_rain", severity: "orange", metricLabel: "Rain", metricValue: "45mm" },
    { type: "strong_wind", severity: "yellow", metricLabel: "Wind", metricValue: "28km/h" },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-primary">
            {language === "gu" ? "સ્માર્ટ એલર્ટ સેન્ટર" : language === "hi" ? "स्मार्ट अलर्ट सेंटर" : "Smart Alert Center"}
          </p>
          <h2 className="text-base font-black text-foreground">
            {language === "gu" ? "પાક અને વાતાવરણ ચેતવણીઓ" : language === "hi" ? "फसल और मौसम अलर्ट" : "Crop & Weather Alerts"}
          </h2>
        </div>
        {!isPremium && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-black text-amber-600 border border-amber-400/25">
            <Lock className="w-3.5 h-3.5" />
            <span>Premium Locked</span>
          </span>
        )}
      </div>

      {/* Flashing Banner for Critical Alerts */}
      {isPremium && criticalAlert && (
        <article className="rounded-2xl border-2 border-red-500 bg-red-50 p-4 shadow-md animate-pulse flex items-start gap-3">
          <div className="rounded-xl bg-red-500 p-2 text-white shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-extrabold uppercase bg-red-200 text-red-900 px-2 py-0.5 rounded-full">
              {language === "gu" ? "તાકીદનું જોખમ" : language === "hi" ? "गंभीर खतरा" : "Critical Warning"}
            </span>
            <h3 className="mt-1 text-sm font-black text-red-950 leading-snug">
              {alertTitle(criticalAlert)}
            </h3>
            <p className="text-xs text-red-900/80 font-bold mt-1">
              {alertMessage(criticalAlert)}
            </p>
          </div>
        </article>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
        {categoryTabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => isPremium && setActiveCategory(tab.id)}
              disabled={!isPremium}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border shrink-0 transition-all select-none ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-soft"
                  : "bg-card text-muted-foreground border-border hover:border-primary/20"
              } ${!isPremium ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {tab.icon}
              <span>{tab.label[language] || tab.label.en}</span>
            </button>
          );
        })}
      </div>

      {/* Alerts Display Panel */}
      {!isPremium ? (
        <div className="min-h-[180px] relative flex flex-col justify-center">
          <div className="space-y-3 opacity-20 select-none blur-[1.5px]">
            {mockAlerts.map((item, index) => (
              <div key={index} className="rounded-2xl border p-4 bg-white shadow-sm flex gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-2xl">
                  {alertIcon(item.type)}
                </span>
                <div className="flex-1">
                  <div className="flex gap-2">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold">
                      {item.severity}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold bg-muted h-4 w-32 rounded animate-pulse" />
                  <p className="mt-1 text-xs bg-muted h-3 w-48 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <PremiumLockOverlay
            title={language === "gu" ? "🔒 સ્માર્ટ એલર્ટ સેન્ટર લૉક છે" : language === "hi" ? "🔒 स्मार्ट अलर्ट सेंटर लॉक है" : "🔒 Smart Alert Center Locked"}
            description={language === "gu" ? "વરસાદ, ભારે પવન, હીટવેવ, ઉચ્ચ ભેજ અને રોગચાળાની કટોકટી ચેતવણીઓ સમયસર મેળવવા માટે પ્રીમિયમ પર અપગ્રેડ કરો." : language === "hi" ? "बारिश, तेज हवा, हीटवेव, उच्च आर्द्रता और फसलों में बीमारी के गंभीर खतरों की लाइव सूचनाएं पाने के लिए प्रीमियम में अपग्रेड करें।" : "Upgrade to Premium to get active crop alarms for rain delays, wind spikes, and critical disease outbreaks based on local data."}
          />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center shadow-sm">
          <ShieldAlert className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
          <p className="text-xs font-bold text-muted-foreground">
            {language === "gu" ? "આ કેટેગરીમાં હાલ કોઈ સક્રિય ચેતવણીઓ નથી" : language === "hi" ? "इस श्रेणी में वर्तमान में कोई सक्रिय अलर्ट नहीं है" : "No active alerts in this category"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const priority = getPriority(alert.severity);
            const config = priorityConfig[priority];
            const isCritical = priority === "critical";

            return (
              <article
                key={`${alert.type}-${alert.metricValue}`}
                className={`rounded-2xl border bg-card p-4 transition-all hover:shadow-sm ${
                  isCritical ? "border-red-400 shadow-md ring-2 ring-red-500/10" : "border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl leading-none shadow-sm" aria-hidden="true">
                    {alertIcon(alert.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase border ${config.bg}`}>
                        {config.label[language] || config.label.en}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                        {t(`weather.intelligence.metrics.${alert.metricLabel}`)}: {alert.metricValue}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-black leading-snug text-foreground">
                      {alertTitle(alert)}
                    </h3>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">
                      {alertMessage(alert)}
                    </p>
                    <div className="mt-3 rounded-xl bg-primary/5 border border-primary/10 px-3 py-2 text-xs font-bold leading-relaxed text-primary">
                      {alertRecommendation(alert)}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SmartWeatherAlerts;
