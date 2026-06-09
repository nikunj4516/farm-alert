import { useState } from "react";
import { Lock, Camera, Upload, RefreshCw, AlertTriangle, CheckCircle, ShieldAlert, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import PremiumLockOverlay from "@/components/ui/PremiumLockOverlay";
import { getSavedSubscriptionTier } from "@/services/subscriptionService";

interface AiDiseaseScannerProps {
  isPremium?: boolean;
}

export const AiDiseaseScanner = ({ isPremium = false }: AiDiseaseScannerProps) => {
  const { language } = useLanguage();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0); // 0: idle, 1: scanning, 2: completed

  const tier = getSavedSubscriptionTier();
  const isPro = tier === "pro";

  const handleStartScan = () => {
    if (!isPro) return;
    setScanning(true);
    setStep(1);
    
    // Simulate steps of AI analysis
    setTimeout(() => {
      setTimeout(() => {
        setScanning(false);
        setStep(2);
        setResult(true);
      }, 1500);
    }, 1200);
  };

  const handleReset = () => {
    setStep(0);
    setResult(false);
  };

  const copy = {
    en: {
      title: "AI Crop Disease Scanner",
      subtitle: "Diagnose plant diseases and pests instantly using your camera",
      scannerBox: "Camera Viewfinder",
      startBtn: "Scan Crop Leaf",
      uploadBtn: "Upload Leaf Image",
      scanning1: "Analyzing leaf patterns...",
      scanning2: "Running crop disease models...",
      resultTitle: "AI Diagnosis Report",
      crop: "Detected Crop",
      disease: "Primary Issue",
      confidence: "Confidence Score",
      severity: "Severity Level",
      treatmentOrganic: "Organic Treatment",
      treatmentChemical: "Chemical Treatment",
      prevention: "Preventive recommendations",
      resetBtn: "Scan New Leaf",
      organicTip: "Mix 10ml Neem Oil in 1L of water. Spray during early mornings.",
      chemicalTip: "Apply Copper Oxychloride 50% WP (2.5g/L) to control spreading.",
      preventTip: "Avoid overhead watering. Maintain proper spacing between crops.",
    },
    gu: {
      title: "AI પાક રોગ સ્કેનર",
      subtitle: "તમારા કેમેરાનો ઉપયોગ કરીને છોડના રોગો અને જીવાતો શોધો",
      scannerBox: "કેમેરા વ્યુફાઇન્ડર",
      startBtn: "પાકના પાન સ્કેન કરો",
      uploadBtn: "પાનનો ફોટો અપલોડ કરો",
      scanning1: "પાનની પેટર્નનું વિશ્લેષણ...",
      scanning2: "રોગ શોધવાના મોડેલ ચાલુ છે...",
      resultTitle: "AI નિદાન અહેવાલ",
      crop: "શોધાયેલ પાક",
      disease: "મુખ્ય સમસ્યા",
      confidence: "ચોકસાઈ સ્કોર",
      severity: "જોખમનું સ્તર",
      treatmentOrganic: "ઓર્ગેનિક ઉપચાર",
      treatmentChemical: "રાસાયણિક ઉપચાર",
      prevention: "નિવારક ભલામણો",
      resetBtn: "નવું પાન સ્કેન કરો",
      organicTip: "૧ લીટર પાણીમાં ૧૦ મિલી લીમડાનું તેલ મિક્સ કરી સવારે છંટકાવ કરો.",
      chemicalTip: "રોગ ફેલાતો અટકાવવા કોપર ઓક્સિક્લોરાઇડ ૫૦% WP (૨.૫ ગ્રામ/લીટર) વાપરો.",
      preventTip: "છોડની ઉપરથી પાણી આપવાનું ટાળો અને પાક વચ્ચે યોગ્ય અંતર રાખો.",
    },
    hi: {
      title: "AI फसल रोग स्कैनर",
      subtitle: "अपने कैमरे का उपयोग करके पौधों के रोगों और कीटों का तुरंत निदान करें",
      scannerBox: "कैमरा व्यूफ़ाइंडर",
      startBtn: "पत्ती स्कैन करें",
      uploadBtn: "पत्ती की फोटो अपलोड करें",
      scanning1: "पत्ती के पैटर्न का विश्लेषण...",
      scanning2: "रोग निदान मॉडल चल रहा है...",
      resultTitle: "AI निदान रिपोर्ट",
      crop: "पहचाना गया पौधा",
      disease: "मुख्य बीमारी",
      confidence: "सटीकता स्कोर",
      severity: "खतरे का स्तर",
      treatmentOrganic: "जैविक उपचार",
      treatmentChemical: "रासायनिक उपचार",
      prevention: "निवारक उपाय",
      resetBtn: "नई पत्ती स्कैन करें",
      organicTip: "1 लीटर पानी में 10 मिली नीम का तेल मिलाएं। सुबह के समय छिड़काव करें।",
      chemicalTip: "बीमारी रोकने के लिए कॉपर ऑक्सीक्लोराइड 50% WP (2.5 ग्राम/लीटर) का प्रयोग करें।",
      preventTip: "ऊपर से पानी डालने से बचें। पौधों के बीच उचित दूरी बनाए रखें।",
    }
  }[language as "en" | "gu" | "hi"];

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="text-center py-2">
        <h2 className="text-xl font-black text-foreground">{copy.title}</h2>
        <p className="text-xs text-muted-foreground font-semibold mt-1">{copy.subtitle}</p>
      </div>

      {!isPro ? (
        <div className="min-h-[360px] relative border border-border bg-card rounded-3xl p-6 shadow-card flex flex-col justify-center items-center">
          <div className="w-full h-48 rounded-2xl bg-muted/40 border border-dashed border-border flex flex-col items-center justify-center opacity-30 select-none blur-[1px]">
            <Camera className="w-12 h-12 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-bold">Launch Camera</p>
          </div>
          <PremiumLockOverlay
            requiredTier="pro"
            title={language === "gu" ? "🔒 AI પાક રોગ સ્કેનર લૉક છે" : language === "hi" ? "🔒 AI फसल रोग स्कैनर लॉक है" : "🔒 AI Disease Scanner Locked"}
            description={language === "gu" ? "કપાસ, ઘઉં અને શાકભાજી જેવા પાકોના રોગનું પિક્ચર દ્વારા ચોક્કસ નિદાન મેળવવા માટે પ્રો પર અપગ્રેડ કરો." : language === "hi" ? "कपास, गेहूं और सब्जियों जैसे फसलों में बीमारियों की पहचान करके तुरंत उपचार की सलाह पाने के लिए प्रो में अपग्रेड करें।" : "Upgrade to Pro to snap leaf photos, identify insect damage, and receive immediate chemical or organic recipes."}
          />
        </div>
      ) : (
        <section className="bg-card border border-border rounded-3xl p-5 shadow-card space-y-4">
          {step === 0 && (
            <div className="space-y-4">
              {/* Camera Viewfinder Mock */}
              <div className="w-full h-56 rounded-2xl bg-slate-900 border-2 border-emerald-500/30 relative flex flex-col items-center justify-center overflow-hidden group">
                <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />

                <div className="absolute top-4 right-12 flex items-center gap-1.5 bg-black/60 rounded-full px-2.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[10px] text-white font-extrabold uppercase tracking-wide">Live View</span>
                </div>

                <div className="text-center p-4">
                  <Camera className="w-12 h-12 text-emerald-500/70 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs text-white/60 font-bold uppercase tracking-wide">Align leaf inside guidelines</p>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-3">
                  <p className="text-[10px] text-white/50 font-semibold">Ready for scanning</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleStartScan}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-black shadow-md hover:bg-primary/95 active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>{copy.startBtn}</span>
                </button>
                <button
                  onClick={handleStartScan}
                  className="flex items-center justify-center gap-2 border border-border bg-background text-foreground rounded-xl py-3.5 text-sm font-black shadow-card hover:bg-muted active:scale-95 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>{copy.uploadBtn}</span>
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="w-full h-56 rounded-2xl bg-slate-900 border-2 border-emerald-500/30 relative flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg animate-bounce" style={{ animationDuration: '2s' }} />

              <div className="text-center space-y-3 p-4 z-10">
                <RefreshCw className="w-8 h-8 text-emerald-400 mx-auto animate-spin" />
                <p className="text-xs text-white font-extrabold tracking-wide">
                  {scanning ? copy.scanning1 : copy.scanning2}
                </p>
              </div>
            </div>
          )}

          {step === 2 && result && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Diagnosis Header */}
              <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-amber-500/10 border border-red-500/20 p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-red-950 flex items-center gap-1.5">
                    {copy.resultTitle}
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-black text-red-700">
                      Warning
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">Diagnosis complete. Review solutions below.</p>
                </div>
              </div>

              {/* Diagnosis Details */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">{copy.crop}</p>
                  <p className="text-xs font-black text-foreground mt-0.5">Cotton (કપાસ / कपास)</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">{copy.confidence}</p>
                  <p className="text-xs font-black text-emerald-600 mt-0.5">94.5% Accuracy</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3 col-span-2">
                  <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">{copy.disease}</p>
                  <p className="text-xs font-black text-red-600 mt-0.5">Cotton Leaf Rust (ફૂગજન્ય ગેરુ રોગ / कवक गेरू रोग)</p>
                </div>
              </div>

              {/* Treatments */}
              <div className="space-y-2.5">
                {/* Organic */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    {copy.treatmentOrganic}
                  </h4>
                  <p className="text-xs font-semibold text-emerald-800 leading-relaxed mt-1">{copy.organicTip}</p>
                </div>

                {/* Chemical */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                  <h4 className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    {copy.treatmentChemical}
                  </h4>
                  <p className="text-xs font-semibold text-blue-800 leading-relaxed mt-1">{copy.chemicalTip}</p>
                </div>

                {/* Prevention */}
                <div className="rounded-2xl border border-border bg-background p-4">
                  <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    {copy.prevention}
                  </h4>
                  <p className="text-xs font-semibold text-muted-foreground leading-relaxed mt-1">{copy.preventTip}</p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-black shadow-md hover:bg-primary/95 active:scale-95 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{copy.resetBtn}</span>
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default AiDiseaseScanner;
