import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface UpgradeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  requiredTier: "premium" | "pro";
}

const UpgradeModal = ({ isOpen, onOpenChange, requiredTier }: UpgradeModalProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/subscription");
  };

  const copy = {
    en: {
      title: requiredTier === "pro" ? "Unlock Pro Features" : "Unlock Premium Features",
      desc: requiredTier === "pro" 
        ? "Access the AI Disease Scanner, Voice AI assistant, and emergency SMS alerts to fully protect your crops." 
        : "Unlock village-level weather forecasts, advanced risk alerts, and WhatsApp notifications.",
      upgradeBtn: "Upgrade Now",
      cancelBtn: "Maybe Later"
    },
    gu: {
      title: requiredTier === "pro" ? "પ્રો સુવિધાઓ અનલોક કરો" : "પ્રીમિયમ સુવિધાઓ અનલોક કરો",
      desc: requiredTier === "pro" 
        ? "તમારા પાકને સુરક્ષિત રાખવા માટે AI પાક રોગ સ્કેનર, વોઇસ AI અને SMS ચેતવણીઓ મેળવો." 
        : "ગામ-સ્તરનું હવામાન, ખાસ કૃષિ એલર્ટ અને વોટ્સએપ ચેતવણીઓ અનલોક કરો.",
      upgradeBtn: "હમણાં અપગ્રેડ કરો",
      cancelBtn: "પછીથી"
    },
    hi: {
      title: requiredTier === "pro" ? "प्रो फीचर्स अनलॉक करें" : "प्रीमियम फीचर्स अनलॉक करें",
      desc: requiredTier === "pro" 
        ? "फसलों की सुरक्षा के लिए AI फसल रोग स्कैनर, वॉयस AI सहायक और आपातकालीन एसएमएस अलर्ट प्राप्त करें।" 
        : "गांव-स्तरीय मौसम पूर्वानुमान, उन्नत कृषि अलर्ट और व्हाट्सएप सूचनाएं अनलॉक करें।",
      upgradeBtn: "अभी अपग्रेड करें",
      cancelBtn: "बाद में"
    }
  }[language as "en" | "gu" | "hi"] || {
    title: requiredTier === "pro" ? "Unlock Pro Features" : "Unlock Premium Features",
    desc: requiredTier === "pro" ? "Unlock AI Disease Scanner, Voice AI, and SMS Alerts." : "Unlock village-level weather and WhatsApp notifications.",
    upgradeBtn: "Upgrade Now",
    cancelBtn: "Maybe Later"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] w-full rounded-3xl p-6 bg-gradient-to-b from-card to-background border-primary/10 shadow-elevated z-[9999]">
        <DialogHeader className="pb-3 border-b border-border text-center flex flex-col items-center">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-white shadow-md ${
            requiredTier === "pro" ? "bg-amber-500" : "bg-blue-600"
          }`}>
            <Lock className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-black text-foreground">
            {copy.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-semibold leading-relaxed mt-2 text-center">
            {copy.desc}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 pt-4">
          <button
            onClick={handleUpgrade}
            className={`w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] text-white ${
              requiredTier === "pro" 
                ? "bg-amber-500 hover:bg-amber-600" 
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            {copy.upgradeBtn}
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="w-full py-3 rounded-xl text-sm font-bold border border-border bg-background hover:bg-muted text-muted-foreground transition-all active:scale-[0.98]"
          >
            {copy.cancelBtn}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
