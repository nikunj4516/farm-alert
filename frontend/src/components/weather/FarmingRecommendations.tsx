import { WeatherReport } from "@/services/weatherService";
import { getCropWeatherThreshold } from "@/services/agricultureWeatherRules";
import { FarmingRecommendation } from "@/services/recommendationEngine";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles } from "lucide-react";
import PremiumLockOverlay from "@/components/ui/PremiumLockOverlay";
import { PermissionService } from "@/services/permissionService";

interface FarmingRecommendationsProps {
  weather: WeatherReport;
  cropType?: string | null;
  recommendations?: FarmingRecommendation[];
  isPremium?: boolean;
}

const FarmingRecommendations = ({ weather, cropType, recommendations: generatedRecommendations }: FarmingRecommendationsProps) => {
  const { t, language } = useLanguage();
  const isPremium = PermissionService.hasPermission("AI Recommendations");
  const crop = t(`weather.intelligence.crops.${getCropWeatherThreshold(cropType).cropName}`);

  // Core generated recommendations based on database rules
  const baseRecommendations = (generatedRecommendations || [])
    .map((item) => {
      const alert = weather.agricultureAlerts.find((candidate) => candidate.type === item.sourceAlertType);
      return alert
        ? t(`weather.intelligence.alerts.${alert.type}.recommendation`).replace("{crop}", crop).replace("{value}", alert.metricValue)
        : item.message;
    })
    .slice(0, 2);

  const safeRecommendations = [
    t("weather.intelligence.safeAction1"),
    t("weather.intelligence.safeAction2"),
  ];

  // Dynamic AI Agricultural Analysis Layer (Inputs: Temp, Rain, Humidity, Wind, UV -> Outputs)
  const getAiRecommendations = () => {
    const list = [];
    const temp = weather.temperature ?? 0;
    const rainProb = weather.precipitation_probability ?? 0;
    const humidity = weather.humidity ?? 0;
    const wind = weather.wind_speed ?? 0;
    const uv = weather.uv_index ?? 0;

    // Rule 1: Rain/Spraying
    if (rainProb >= 40) {
      list.push(
        language === "gu"
          ? "આગામી કલાકોમાં વરસાદની શક્યતા હોવાથી દવા છંટકાવ કરવાનું ટાળો."
          : language === "hi"
          ? "अगले कुछ घंटों में बारिश की संभावना है। दवा छिड़काव से बचें।"
          : "Rain expected in the next few hours. Avoid pesticide spraying."
      );
    } else if (wind >= 20) {
      list.push(
        language === "gu"
          ? "પવનની ઝડપ વધુ હોવાથી ખાતર અથવા દવાનો છંટકાવ ટાળો."
          : language === "hi"
          ? "तेज हवा चल रही है। खाद या दवा का छिड़काव टालें।"
          : "Strong wind tomorrow. Avoid fertilizer spraying today."
      );
    }

    // Rule 2: Humidity/Fungal Risk
    if (humidity >= 85) {
      list.push(
        language === "gu"
          ? "હવામાં ભેજ ૮૫% થી વધુ છે. પાકમાં ફૂગજન્ય રોગચાળાનું ધ્યાન રાખો."
          : language === "hi"
          ? "नमी 85% से अधिक है। फसलों में फंगल संक्रमण का विशेष ध्यान रखें।"
          : "Humidity is above 85%. Monitor crops closely for fungal disease risk."
      );
    }

    // Rule 3: Irrigation
    const willRainSoon = weather.forecast.slice(0, 5).some(day => (day.precipitationProbability ?? 0) >= 50);
    if (!willRainSoon) {
      list.push(
        language === "gu"
          ? "આગામી ૫ દિવસ વરસાદની કોઈ શક્યતા નથી. પાક માટે પિયતની ભલામણ છે."
          : language === "hi"
          ? "अगले 5 दिनों में बारिश की कोई संभावना नहीं है। सिंचाई की सलाह दी जाती है।"
          : "No rainfall expected for 5 days. Irrigation is recommended."
      );
    } else {
      list.push(
        language === "gu"
          ? "આગામી દિવસોમાં વરસાદની સંભાવના છે, સિંચાઈ મુલતવી રાખવાનું વિચારો."
          : language === "hi"
          ? "आने वाले दिनों में बारिश की उम्मीद है, सिंचाई स्थगित करने पर विचार करें।"
          : "Rainfall expected in the coming days. Consider postponing irrigation."
      );
    }

    // Rule 4: UV Stress
    if (uv >= 8) {
      list.push(
        language === "gu"
          ? "યુવી ઈન્ડેક્સ ઘણો ઊંચો છે. બપોરના સમયે ટ્રાન્સપ્લાન્ટેશન ટાળો."
          : language === "hi"
          ? "यूवी सूचकांक बहुत अधिक है। दोपहर के समय रोपाई से बचें।"
          : "High UV index today. Avoid transplantation or pruning during mid-day."
      );
    }

    return list.slice(0, 3);
  };

  const aiRecs = getAiRecommendations();
  const allRecommendations = [...baseRecommendations, ...aiRecs];
  const displayRecommendations = allRecommendations.length ? allRecommendations : safeRecommendations;

  const mockRecommendations = [
    language === "gu"
      ? "આગામી કલાકોમાં વરસાદની શક્યતા હોવાથી દવા છંટકાવ કરવાનું ટાળો."
      : language === "hi"
      ? "अगले कुछ घंटों में बारिश की संभावना है। दवा छिड़काव से बचें।"
      : "Rain expected in 4 hours. Avoid pesticide spraying.",
    language === "gu"
      ? "હવામાં ભેજ ૮૫% થી વધુ છે. પાકમાં ફૂગજન્ય રોગચાળાનું ધ્યાન રાખો."
      : language === "hi"
      ? "नमी 85% से अधिक है। फसलों में फंगल संक्रमण का विशेष ध्यान रखें।"
      : "Humidity above 85%. Monitor fungal disease risk.",
    language === "gu"
      ? "આગામી ૫ દિવસ વરસાદની કોઈ શક્યતા નથી. પાક માટે પિયતની ભલામણ છે."
      : language === "hi"
      ? "अगले 5 दिनों में बारिश की कोई संभावना नहीं है। सिंचाई की सलाह दी जाती है।"
      : "No rainfall for 5 days. Irrigation recommended.",
  ];

  return (
    <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-emerald-50 via-white to-sky-50/20 p-5 shadow-card relative overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary animate-pulse shrink-0" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-primary">
            {language === "gu" ? "AI હવામાન સલાહ" : language === "hi" ? "AI मौसम सलाह" : "AI Weather Intelligence"}
          </p>
          <h2 className="text-base font-black text-foreground">
            {language === "gu" ? "ખેતી માટે ભલામણ કરેલ કાર્યો" : language === "hi" ? "फसल प्रबंधन की सलाह" : "AI Farming Recommendations"}
          </h2>
        </div>
      </div>

      {!isPremium ? (
        <div className="min-h-[160px] relative flex flex-col justify-center">
          <div className="space-y-2.5 opacity-20 select-none blur-[1.5px]">
            {mockRecommendations.map((item, index) => (
              <div key={index} className="flex gap-3 rounded-xl bg-white/70 p-3.5 border border-border">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-black text-primary">
                  {index + 1}
                </span>
                <p className="text-xs font-bold leading-relaxed text-foreground">{item}</p>
              </div>
            ))}
          </div>
          <PremiumLockOverlay
            title={language === "gu" ? "🔒 AI હવામાન સલાહ લૉક છે" : language === "hi" ? "🔒 AI मौसम सलाह लॉक है" : "🔒 AI Intelligence Recommendations Locked"}
            description={language === "gu" ? "તમારા પાક માટે સિંચાઈ, છંટકાવ અને ફૂગજન્ય રોગોની ભલામણો અનલૉક કરવા માટે પ્રીમિયમ પર અપગ્રેડ કરો." : language === "hi" ? "फसलों के लिए सिंचाई, छिड़काव और कीट/रोग नियंत्रण संबंधी सलाह प्राप्त करने के लिए प्रीमियम में अपग्रेड करें।" : "Unlock personalized irrigation timing, spraying windows, and crop disease alerts customized for your farm."}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {displayRecommendations.map((item, index) => (
            <div key={`${item}-${index}`} className="flex gap-3 rounded-2xl bg-white/80 border border-emerald-100/50 p-4 shadow-sm hover:border-primary/20 transition-all">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground shadow-sm">
                {index + 1}
              </span>
              <p className="text-xs font-semibold leading-relaxed text-foreground">{item}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FarmingRecommendations;
