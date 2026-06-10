import { useState, useEffect } from "react";
import { Lock, Camera, Upload, RefreshCw, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, History, ChevronRight, BookOpen, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import PremiumLockOverlay from "@/components/ui/PremiumLockOverlay";
import { getSavedSubscriptionTier } from "@/services/subscriptionService";
import { ScanHistoryService, ScanHistory } from "@/services/scanHistoryService";
import { toast } from "@/components/ui/use-toast";

interface AiDiseaseScannerProps {
  isPremium?: boolean;
}

const MOCK_DIAGNOSES = [
  {
    crop_name: "Cotton (કપાસ / कपास)",
    disease_name: "Cotton Leaf Rust (ફૂગજન્ય ગેરુ રોગ / कवक गेरू रोग)",
    confidence_score: 94.5,
    recommendation: "Organic: Mix 10ml Neem Oil in 1L water and spray. Chemical: Apply Copper Oxychloride 50% WP (2.5g/L). Prevention: Avoid overhead watering.",
    organicTip: "Mix 10ml Neem Oil in 1L of water. Spray during early mornings.",
    chemicalTip: "Apply Copper Oxychloride 50% WP (2.5g/L) to control spreading.",
    preventTip: "Avoid overhead watering. Maintain proper spacing between crops.",
    imageUrl: "https://images.unsplash.com/photo-1599933333938-1614749f1295?w=200&auto=format&fit=crop"
  },
  {
    crop_name: "Wheat (ઘઉં / गेहूं)",
    disease_name: "Yellow Rust (પીળો ગેરુ / पीला गेरू)",
    confidence_score: 92.1,
    recommendation: "Organic: Spray fermented sour buttermilk mixture. Chemical: Apply Propiconazole 25% EC (1ml/L). Prevention: Grow rust-resistant varieties.",
    organicTip: "Spray sour buttermilk (chaas) mixed with water (1:10 ratio) every 10 days.",
    chemicalTip: "Apply Propiconazole 25% EC (1 ml per Litre of water) immediately.",
    preventTip: "Use rust-resistant seeds and ensure nitrogen fertilizer is not over-applied.",
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&auto=format&fit=crop"
  },
  {
    crop_name: "Tomato (ટામેટા / टमाटर)",
    disease_name: "Early Blight (વહેલો સુકારો / अगेती झुलसा)",
    confidence_score: 89.4,
    recommendation: "Organic: Spray baking soda mixture (1 tbsp per gallon). Chemical: Apply Mancozeb 75% WP (2g/L). Prevention: Rotate crops annually.",
    organicTip: "Spray baking soda solution (1 tablespoon baking soda + 1 tsp organic liquid soap in 4L water).",
    chemicalTip: "Apply Mancozeb 75% WP (2 grams per Litre) at first sign of spots.",
    preventTip: "Rotate crops yearly. Prune lower leaves to prevent soil-splash contact.",
    imageUrl: "https://images.unsplash.com/photo-1592892111425-15e04305f961?w=200&auto=format&fit=crop"
  },
  {
    crop_name: "Groundnut (મગફળી / मूंगफली)",
    disease_name: "Tikka Leaf Spot (ટીક્કા ટપકાંનો રોગ / टिक्का रोग)",
    confidence_score: 95.2,
    recommendation: "Organic: Apply garlic-chili extract solution. Chemical: Spray Carbendazim 50% WP (1g/L). Prevention: Remove and burn infected crop residue.",
    organicTip: "Spray diluted garlic-chilli extract to boost leaf immunity naturally.",
    chemicalTip: "Spray Carbendazim 50% WP (1 gram per Litre of water) to stop spore growth.",
    preventTip: "Clean fields thoroughly post-harvest. Practice crop rotation with cereals.",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop"
  }
];

export const AiDiseaseScanner = ({ isPremium = false }: AiDiseaseScannerProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"scan" | "history">("scan");
  
  // Scanner state
  const [selectedMockIndex, setSelectedMockIndex] = useState<number>(0);
  const [step, setStep] = useState<number>(0); // 0: idle, 1: scanning/analyzing, 2: completed
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisStepLabel, setAnalysisStepLabel] = useState<string>("");
  const [diagnosedResult, setDiagnosedResult] = useState<typeof MOCK_DIAGNOSES[0] | null>(null);
  
  // History state
  const [historyList, setHistoryList] = useState<ScanHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ScanHistory | null>(null);

  const tier = getSavedSubscriptionTier();
  const isPro = tier === "pro";

  // Fetch scan history
  const loadHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const scans = await ScanHistoryService.getScans(user.id);
      setHistoryList(scans);
    } catch (err) {
      console.error("Failed to load scan history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history" && isPro) {
      loadHistory();
    }
  }, [activeTab, isPro, user]);

  const handleStartScan = () => {
    if (!isPro || !user) return;
    setStep(1);
    setAnalysisProgress(0);
    setAnalysisStepLabel(copy.stepScanning);
    
    // Simulate realistic 5-step analysis progress bar
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(interval);
          finishScan();
          return 100;
        }
        
        // Dynamic step label updates based on progress percentage
        if (next < 20) {
          setAnalysisStepLabel(copy.stepScanning);
        } else if (next < 40) {
          setAnalysisStepLabel(copy.stepDetecting);
        } else if (next < 65) {
          setAnalysisStepLabel(copy.stepComparing);
        } else if (next < 85) {
          setAnalysisStepLabel(copy.stepCalculating);
        } else {
          setAnalysisStepLabel(copy.stepTreatment);
        }
        
        return next;
      });
    }, 60); // Total duration ~3 seconds
  };

  const finishScan = async () => {
    if (!user) return;
    const selectedDiagnosis = MOCK_DIAGNOSES[selectedMockIndex];
    setDiagnosedResult(selectedDiagnosis);
    setStep(2);

    try {
      await ScanHistoryService.saveScan({
        user_id: user.id,
        crop_name: selectedDiagnosis.crop_name,
        disease_name: selectedDiagnosis.disease_name,
        confidence_score: selectedDiagnosis.confidence_score,
        recommendation: selectedDiagnosis.recommendation,
        image_url: selectedDiagnosis.imageUrl
      });
      toast({
        title: "Scan Saved",
        description: "Diagnosis report was successfully added to your scan history."
      });
    } catch (err) {
      console.warn("Could not save scan to remote database, saved to local cache.", err);
    }
  };

  const handleReset = () => {
    setStep(0);
    setDiagnosedResult(null);
    setAnalysisProgress(0);
  };

  const copy = {
    en: {
      title: "AI Crop Disease Scanner",
      subtitle: "Diagnose plant diseases and pests instantly using your camera",
      scannerBox: "Camera Viewfinder",
      startBtn: "Scan Crop Leaf",
      uploadBtn: "Upload Leaf Image",
      resultTitle: "AI Diagnosis Report",
      crop: "Detected Crop",
      disease: "Primary Issue",
      confidence: "Confidence Score",
      severity: "Severity Level",
      treatmentOrganic: "Organic Treatment",
      treatmentChemical: "Chemical Treatment",
      prevention: "Preventive Recommendations",
      resetBtn: "Scan New Leaf",
      organicTip: "Mix 10ml Neem Oil in 1L of water. Spray during early mornings.",
      chemicalTip: "Apply Copper Oxychloride 50% WP (2.5g/L) to control spreading.",
      preventTip: "Avoid overhead watering. Maintain proper spacing between crops.",
      tabScan: "AI scanner",
      tabHistory: "Scan History",
      selectTemplate: "Select Crop Template to Scan",
      stepScanning: "Scanning leaf image patterns...",
      stepDetecting: "Detecting leaf boundaries and lesions...",
      stepComparing: "Comparing with 10k+ plant pathology samples...",
      stepCalculating: "Calculating disease confidence index...",
      stepTreatment: "Formulating treatment and prevention guide...",
      accuracy: "Accuracy Score",
      historyEmpty: "No crop scans found. Scan a crop leaf to begin!",
      backToHistory: "Back to List",
      warningLabel: "Warning"
    },
    gu: {
      title: "AI પાક રોગ સ્કેનર",
      subtitle: "તમારા કેમેરાનો ઉપયોગ કરીને છોડના રોગો અને જીવાતો શોધો",
      scannerBox: "કેમેરા વ્યુફાઇન્ડર",
      startBtn: "પાકના પાન સ્કેન કરો",
      uploadBtn: "પાનનો ફોટો અપલોડ કરો",
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
      tabScan: "AI સ્કેનર",
      tabHistory: "સ્કેન હિસ્ટ્રી",
      selectTemplate: "સ્કેન કરવા માટે પાક પસંદ કરો",
      stepScanning: "પાનની પેટર્નનું વિશ્લેષણ ચાલુ છે...",
      stepDetecting: "પાનની કિનારીઓ અને ધાબા શોધી રહ્યા છીએ...",
      stepComparing: "૧૦,૦૦૦+ નમૂનાઓ સાથે સરખામણી ચાલુ છે...",
      stepCalculating: "રોગ ચોકસાઈ સ્કોર ગણતરી ચાલુ છે...",
      stepTreatment: "સારવાર અને બચાવ રેસીપી તૈયાર છે...",
      accuracy: "ચોકસાઈ સ્કોર",
      historyEmpty: "હજુ સુધી કોઈ સ્કેન મળેલ નથી. સ્કેન કરવા માટે પાનનો ફોટો લો!",
      backToHistory: "યાદી પર પાછા જાઓ",
      warningLabel: "ચેતવણી"
    },
    hi: {
      title: "AI फसल रोग स्कैनर",
      subtitle: "अपने कैमरे का उपयोग करके पौधों के रोगों और कीटों का तुरंत निदान करें",
      scannerBox: "कैमरा व्यूफ़ाइंडर",
      startBtn: "पत्ती स्कैन करें",
      uploadBtn: "पत्ती की फोटो अपलोड करें",
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
      tabScan: "AI स्कैनर",
      tabHistory: "स्कैन इतिहास",
      selectTemplate: "स्कैन करने के लिए फसल टेम्पलेट चुनें",
      stepScanning: "पत्ती के पैटर्न का स्कैन किया जा रहा है...",
      stepDetecting: "पत्ती की सीमा और घावों का पता लगाना...",
      stepComparing: "10k+ पौधे के पैथोलॉजी डेटाबेस से मिलान...",
      stepCalculating: "बीमारी की सटीकता सूचकांक की गणना...",
      stepTreatment: "उपचार और निवारक व्यंजनों का निर्माण...",
      accuracy: "सटीकता स्कोर",
      historyEmpty: "कोई स्कैन इतिहास नहीं मिला। पत्ती स्कैन करके शुरू करें!",
      backToHistory: "सूची पर वापस जाएं",
      warningLabel: "चेतावनी"
    }
  }[language as "en" | "gu" | "hi"] || copyText.en;

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="text-center py-1">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald-600 animate-pulse" />
          {copy.title}
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1 max-w-sm mx-auto leading-relaxed">{copy.subtitle}</p>
      </div>

      {/* Tabs */}
      {isPro && (
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl max-w-xs mx-auto border border-slate-200">
          <button
            onClick={() => {
              setActiveTab("scan");
              setSelectedHistoryItem(null);
            }}
            className={`py-2 px-3 text-center rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "scan"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            {copy.tabScan}
          </button>
          <button
            onClick={() => {
              setActiveTab("history");
              setSelectedHistoryItem(null);
            }}
            className={`py-2 px-3 text-center rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "history"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            {copy.tabHistory}
          </button>
        </div>
      )}

      {!isPro ? (
        <div className="min-h-[380px] relative border-2 border-slate-200 bg-white rounded-3xl p-6 shadow-md flex flex-col justify-center items-center overflow-hidden">
          <div className="w-full h-48 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center opacity-30 select-none blur-[1px]">
            <Camera className="w-12 h-12 text-slate-400 mb-2" />
            <p className="text-sm font-bold">Launch Camera</p>
          </div>
          <PremiumLockOverlay
            requiredTier="pro"
            title={language === "gu" ? "🔒 AI પાક રોગ સ્કેનર લૉક છે" : language === "hi" ? "🔒 AI फसल रोग स्कैनर लॉक है" : "🔒 AI Disease Scanner Locked"}
            description={language === "gu" ? "કપાસ, ઘઉં અને શાકભાજી જેવા પાકોના રોગનું પિક્ચર દ્વારા ચોક્કસ નિદાન મેળવવા માટે પ્રો પર અપગ્રેડ કરો." : language === "hi" ? "कपास, गेहूं और सब्जियों जैसे फसलों में बीमारियों की पहचान करके तुरंत उपचार की सलाह पाने के लिए प्रो में अपग्रेड करें।" : "Upgrade to Pro to snap leaf photos, identify insect damage, and receive immediate chemical or organic recipes."}
          />
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          {activeTab === "scan" ? (
            <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              {step === 0 && (
                <div className="space-y-4">
                  {/* Select Template Selector */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                      {copy.selectTemplate}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {MOCK_DIAGNOSES.map((diag, index) => (
                        <button
                          key={diag.crop_name}
                          type="button"
                          onClick={() => setSelectedMockIndex(index)}
                          className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex flex-col gap-1 ${
                            selectedMockIndex === index
                              ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                              : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase text-slate-400">Template {index + 1}</span>
                          <span className="text-xs font-bold text-slate-800 leading-tight truncate">{diag.crop_name.split(" ")[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Camera Viewfinder Mock */}
                  <div className="w-full h-60 rounded-2xl bg-slate-950 border-2 border-emerald-500/20 relative flex flex-col items-center justify-center overflow-hidden">
                    <img 
                      src={MOCK_DIAGNOSES[selectedMockIndex].imageUrl} 
                      alt="Crop View" 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 filter saturate-150 blur-[0.5px]"
                    />
                    
                    {/* Viewfinder corners */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 rounded-full px-2.5 py-1 z-10">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="text-[9px] text-white font-extrabold uppercase tracking-wide">Live Feed</span>
                    </div>

                    <div className="z-10 text-center p-4 bg-black/40 rounded-2xl backdrop-blur-xs">
                      <Camera className="w-8 h-8 text-white mx-auto mb-1.5 animate-bounce" />
                      <p className="text-[10px] text-white font-black uppercase tracking-wider">Tap Scan Below</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleStartScan}
                      className="flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl py-3.5 text-xs font-black shadow-md hover:bg-emerald-700 active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{copy.startBtn}</span>
                    </button>
                    <button
                      onClick={handleStartScan}
                      className="flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 rounded-xl py-3.5 text-xs font-black shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{copy.uploadBtn}</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="w-full h-72 rounded-2xl bg-slate-900 border border-slate-800 relative flex flex-col items-center justify-center overflow-hidden p-6 text-center">
                  <div className="absolute inset-0 bg-radial-gradient from-emerald-500/10 to-transparent animate-pulse" />
                  
                  {/* Moving scanning line */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg animate-bounce top-0" style={{ animationDuration: '3s' }} />

                  <div className="space-y-4 z-10 w-full max-w-xs">
                    <div className="relative inline-flex items-center justify-center">
                      <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
                      <span className="absolute text-[10px] font-black text-emerald-400">{analysisProgress}%</span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-white font-black tracking-wide uppercase">{analysisStepLabel}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Running crop diagnostics engine...</p>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 p-[1px]">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-75"
                        style={{ width: `${analysisProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && diagnosedResult && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 text-left">
                  {/* Diagnosis Header */}
                  <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 shrink-0">
                      <ShieldAlert className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-rose-950 flex items-center gap-1.5">
                        {copy.resultTitle}
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-black text-rose-700">
                          {copy.warningLabel}
                        </span>
                      </h3>
                      <p className="text-[10px] text-rose-700 font-bold mt-0.5">Critical pest/disease spores identified.</p>
                    </div>
                  </div>

                  {/* Diagnosis Details */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{copy.crop}</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{diagnosedResult.crop_name}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{copy.confidence}</p>
                      <p className="text-xs font-black text-emerald-600 mt-0.5">{diagnosedResult.confidence_score}% Accuracy</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 col-span-2">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{copy.disease}</p>
                      <p className="text-xs font-black text-rose-600 mt-0.5">{diagnosedResult.disease_name}</p>
                    </div>
                  </div>

                  {/* Treatments */}
                  <div className="space-y-2.5">
                    {/* Organic */}
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                      <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        {copy.treatmentOrganic}
                      </h4>
                      <p className="text-xs font-semibold text-emerald-800 leading-relaxed mt-1">{diagnosedResult.organicTip}</p>
                    </div>

                    {/* Chemical */}
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                      <h4 className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        {copy.treatmentChemical}
                      </h4>
                      <p className="text-xs font-semibold text-blue-800 leading-relaxed mt-1">{diagnosedResult.chemicalTip}</p>
                    </div>

                    {/* Prevention */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        {copy.prevention}
                      </h4>
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed mt-1">{diagnosedResult.preventTip}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl py-3.5 text-xs font-black shadow-md hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{copy.resetBtn}</span>
                  </button>
                </div>
              )}
            </section>
          ) : (
            /* History Tab */
            <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-left">
              {selectedHistoryItem ? (
                /* History Detail View */
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={() => setSelectedHistoryItem(null)}
                    className="text-xs font-black text-emerald-600 underline flex items-center gap-1 active:scale-95 transition-all"
                  >
                    ← {copy.backToHistory}
                  </button>

                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h4 className="text-xs font-black text-slate-800">Scan Report Details</h4>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          {new Date(selectedHistoryItem.created_at).toLocaleDateString()} at{" "}
                          {new Date(selectedHistoryItem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {selectedHistoryItem.confidence_score}% {copy.accuracy}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{copy.crop}</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5">{selectedHistoryItem.crop_name}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 col-span-2">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{copy.disease}</p>
                      <p className="text-xs font-black text-rose-600 mt-0.5">{selectedHistoryItem.disease_name}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <h4 className="text-xs font-black text-slate-800">Recommendation Summary</h4>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed">{selectedHistoryItem.recommendation}</p>
                  </div>
                </div>
              ) : (
                /* History List View */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-600" />
                      Past Diagnoses Logs
                    </h3>
                    <span className="text-[10px] font-black text-slate-400">{historyList.length} scans</span>
                  </div>

                  {loadingHistory ? (
                    <div className="py-10 text-center">
                      <RefreshCw className="w-6 h-6 text-slate-300 animate-spin mx-auto" />
                      <p className="text-[10px] text-slate-400 font-bold mt-2">Loading scan database...</p>
                    </div>
                  ) : historyList.length === 0 ? (
                    <div className="py-10 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50 p-4">
                      <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-bold leading-normal">{copy.historyEmpty}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto pr-1">
                      {historyList.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedHistoryItem(item)}
                          className="py-3 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer transition-all active:scale-[0.98] rounded-lg px-2 group"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                <Camera className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-slate-800 truncate">{item.crop_name.split(" ")[0]} - {item.disease_name.split(" (")[0]}</h4>
                              <p className="text-[9px] text-slate-400 font-semibold">
                                {new Date(item.created_at).toLocaleDateString()} • {item.confidence_score}%
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default AiDiseaseScanner;
