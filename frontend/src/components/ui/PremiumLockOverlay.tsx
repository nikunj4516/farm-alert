import { useState } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import UpgradeModal from "./UpgradeModal";

interface PremiumLockOverlayProps {
  title?: string;
  description?: string;
  compact?: boolean;
  requiredTier?: "premium" | "pro";
}

const copyText = {
  en: {
    premiumTitle: "Premium Feature",
    proTitle: "Pro Feature",
    premiumDesc: "Upgrade to Premium to unlock village-level weather, advanced alerts, farming recommendations, and WhatsApp notifications.",
    proDesc: "Upgrade to Pro to unlock the AI Disease Scanner, SMS alerts, and the Voice AI Assistant.",
    cta: "Upgrade Plan",
  },
  gu: {
    premiumTitle: "પ્રીમિયમ ફીચર",
    proTitle: "પ્રો ફીચર",
    premiumDesc: "ગામ-સ્તરનું હવામાન, સ્માર્ટ એલર્ટ, ભલામણો અને વોટ્સએપ ચેતવણીઓ અનલોક કરવા માટે પ્રીમિયમ પર અપગ્રેડ કરો.",
    proDesc: "AI પાક રોગ સ્કેનર, SMS ચેતવણીઓ અને વોઇસ AI આસિસ્ટન્ટ અનલોક કરવા માટે પ્રો પર અપગ્રેડ કરો.",
    cta: "પ્લાન અપગ્રેડ કરો",
  },
  hi: {
    premiumTitle: "प्रीमियम फीचर",
    proTitle: "प्रो फीचर",
    premiumDesc: "गांव-स्तरीय मौसम, विशेष अलर्ट, कृषि सलाह और व्हाट्सएप सूचनाएं अनलॉक करने के लिए प्रीमियम में अपग्रेड करें.",
    proDesc: "AI फसल रोग स्कैनर, एसएमएस अलर्ट और वॉयस AI सहायक अनलॉक करने के लिए प्रो में अपग्रेड करें.",
    cta: "प्लान अपग्रेड करें",
  },
};

export const PremiumLockOverlay = ({ title, description, compact = false, requiredTier = "premium" }: PremiumLockOverlayProps) => {
  const { language } = useLanguage();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const copy = copyText[language] || copyText.en;

  const displayTitle = title || (requiredTier === "pro" ? copy.proTitle : copy.premiumTitle);
  const displayDesc = description || (requiredTier === "pro" ? copy.proDesc : copy.premiumDesc);

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUpgrade(true);
  };

  if (compact) {
    return (
      <>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 z-10 rounded-2xl">
          <button
            onClick={handleUpgradeClick}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-black shadow-md hover:bg-primary/95 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{copy.cta}</span>
          </button>
        </div>
        <UpgradeModal 
          isOpen={showUpgrade} 
          onOpenChange={setShowUpgrade} 
          requiredTier={requiredTier} 
        />
      </>
    );
  }

  return (
    <>
      <div className="absolute inset-0 bg-background/70 backdrop-blur-[6px] flex flex-col items-center justify-center text-center p-5 z-10 rounded-2xl border border-primary/10">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-3 text-primary animate-pulse">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-foreground flex items-center justify-center gap-1.5">
          {displayTitle}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground font-semibold leading-relaxed max-w-[280px] mx-auto">
          {displayDesc}
        </p>
        <button
          onClick={handleUpgradeClick}
          className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-emerald-700 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-black shadow-md active:scale-95 transition-transform"
        >
          <span>{copy.cta}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <UpgradeModal 
        isOpen={showUpgrade} 
        onOpenChange={setShowUpgrade} 
        requiredTier={requiredTier} 
      />
    </>
  );
};

export default PremiumLockOverlay;
