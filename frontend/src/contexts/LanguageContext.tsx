import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "gu" | "hi" | "en";

const translations = {
  // Splash Screen
  splash_tagline: {
    gu: "હવામાન ચેતવણી • ખેતી ટિપ્સ • સમાચાર",
    hi: "मौसम चेतावनी • खेती टिप्स • समाचार",
    en: "Weather Alerts • Farming Tips • News",
  },
  splash_footer: {
    gu: "ભારતના ખેડૂતો માટે બનાવેલ 🌾",
    hi: "भारत के किसानों के लिए बनाया गया 🌾",
    en: "Made for India's Farmers 🌾",
  },
  choose_language: {
    gu: "ભાષા પસંદ કરો",
    hi: "भाषा चुनें",
    en: "Choose Language",
  },
  choose_language_subtitle: {
    gu: "તમારી પસંદગીની ભાષા પસંદ કરો",
    hi: "अपनी पसंदीदा भाषा चुनें",
    en: "Choose your preferred language",
  },

  // Login
  login_phone_label: {
    gu: "મોબાઈલ નંબર",
    hi: "मोबाइल नंबर",
    en: "Mobile Number",
  },
  login_phone_helper: {
    gu: "અમે તમારો નંબર ચકાસવા OTP મોકલીશું",
    hi: "हम आपका नंबर सत्यापित करने के लिए OTP भेजेंगे",
    en: "We will send an OTP to verify your number",
  },
  login_phone_error: {
    gu: "કૃપા કરીને 10 અંકનો મોબાઈલ નંબર નાખો",
    hi: "कृपया 10 अंकों का मोबाइल नंबर दर्ज करें",
    en: "Please enter a 10-digit mobile number",
  },
  login_otp_error: {
    gu: "કૃપા કરીને 6 અંકનો OTP નાખો",
    hi: "कृपया 6 अंकों का OTP दर्ज करें",
    en: "Please enter a 6-digit OTP",
  },
  login_send_otp: {
    gu: "OTP મોકલો",
    hi: "OTP भेजें",
    en: "Send OTP",
  },
  login_otp_sent: {
    gu: "પર OTP મોકલ્યો છે",
    hi: "पर OTP भेजा गया है",
    en: "OTP sent to",
  },
  login_otp_label: {
    gu: "OTP નંબર",
    hi: "OTP नंबर",
    en: "OTP Number",
  },
  login_verify: {
    gu: "ચકાસો",
    hi: "सत्यापित करें",
    en: "Verify",
  },
  login_change_number: {
    gu: "← નંબર બદલો",
    hi: "← नंबर बदलें",
    en: "← Change Number",
  },
  login_secure: {
    gu: "🔒 તમારો નંબર સુરક્ષિત છે",
    hi: "🔒 आपका नंबर सुरक्षित है",
    en: "🔒 Your number is secure",
  },
  login_welcome: {
    gu: "ફરી આવો!",
    hi: "वापस आइए!",
    en: "Welcome back!",
  },
  login_subtitle: {
    gu: "તમારા ખેતરની માહિતી મેળવવા લૉગિન કરો",
    hi: "अपने खेत की जानकारी पाने के लिए लॉगिन करें",
    en: "Login to get updates about your farm",
  },

  // Profile Setup
  profile_title: {
    gu: "તમારી માહિતી",
    hi: "आपकी जानकारी",
    en: "Your Information",
  },
  profile_subtitle: {
    gu: "આ માહિતી તમને વધુ સારી ટિપ્સ આપવા માટે છે",
    hi: "यह जानकारी आपको बेहतर सुझाव देने के लिए है",
    en: "This information helps us give you better tips",
  },
  profile_step_personal: {
    gu: "વ્યક્તિગત",
    hi: "व्यक्तिगत",
    en: "Personal",
  },
  profile_step_location: {
    gu: "સ્થાન",
    hi: "स्थान",
    en: "Location",
  },
  profile_step_farming: {
    gu: "ખેતી",
    hi: "खेती",
    en: "Farming",
  },
  profile_name: {
    gu: "તમારું નામ *",
    hi: "आपका नाम *",
    en: "Your Name *",
  },
  profile_name_placeholder: {
    gu: "દા.ત. રમેશભાઈ પટેલ",
    hi: "जैसे राजेश कुमार",
    en: "e.g. Ramesh Patel",
  },
  profile_village: {
    gu: "ગામ",
    hi: "गाँव",
    en: "Village",
  },
  profile_village_placeholder: {
    gu: "દા.ત. વડગામ",
    hi: "जैसे रामपुर",
    en: "e.g. Vadgam",
  },
  profile_district: {
    gu: "જિલ્લો",
    hi: "जिला",
    en: "District",
  },
  profile_district_placeholder: {
    gu: "દા.ત. અમદાવાદ",
    hi: "जैसे अहमदाबाद",
    en: "e.g. Ahmedabad",
  },
  profile_crop: {
    gu: "મુખ્ય પાક",
    hi: "मुख्य फसल",
    en: "Main Crop",
  },
  profile_land: {
    gu: "જમીન (એકર)",
    hi: "ज़मीन (एकड़)",
    en: "Land (Acres)",
  },
  profile_land_placeholder: {
    gu: "દા.ત. 5",
    hi: "जैसे 5",
    en: "e.g. 5",
  },
  profile_save: {
    gu: "સેવ કરો",
    hi: "सेव करें",
    en: "Save",
  },
  profile_skip: {
    gu: "પછીથી ભરીશ →",
    hi: "बाद में भरूँगा →",
    en: "Fill Later →",
  },
  profile_next: {
    gu: "આગળ",
    hi: "आगे",
    en: "Next",
  },
  profile_back: {
    gu: "પાછળ",
    hi: "पीछे",
    en: "Back",
  },
  crops: {
    gu: ["ઘઉં", "ડાંગર", "કપાસ", "મગફળી", "શેરડી", "શાકભાજી", "અન્ય"],
    hi: ["गेहूँ", "धान", "कपास", "मूँगफली", "गन्ना", "सब्ज़ी", "अन्य"],
    en: ["Wheat", "Rice", "Cotton", "Groundnut", "Sugarcane", "Vegetables", "Other"],
  },
  crop_icons: {
    gu: ["🌾", "🍚", "🧵", "🥜", "🎋", "🥬", "📦"],
    hi: ["🌾", "🍚", "🧵", "🥜", "🎋", "🥬", "📦"],
    en: ["🌾", "🍚", "🧵", "🥜", "🎋", "🥬", "📦"],
  },

  // Index / Dashboard
  location: {
    gu: "અમદાવાદ, ગુજરાત",
    hi: "अहमदाबाद, गुजरात",
    en: "Ahmedabad, Gujarat",
  },
  forecast_title: {
    gu: "🌦️ 5 દિવસનું હવામાન",
    hi: "🌦️ 5 दिन का मौसम",
    en: "🌦️ 5 Days Weather",
  },
  helpline: {
    gu: "કિસાન હેલ્પલાઇન: 1800-180-1551",
    hi: "किसान हेल्पलाइन: 1800-180-1551",
    en: "Farmer Helpline: 1800-180-1551",
  },
  forecast_days: {
    gu: ["આજે", "કાલે", "ગુરુ", "શુક્ર", "શનિ"],
    hi: ["आज", "कल", "गुरु", "शुक्र", "शनि"],
    en: ["Today", "Tomorrow", "Thu", "Fri", "Sat"],
  },
  quick_actions_title: {
    gu: "🌾 ઝડપી ક્રિયાઓ",
    hi: "🌾 त्वरित कार्य",
    en: "🌾 Quick Actions",
  },
  action_crop_tips: {
    gu: "પાક ટિપ્સ",
    hi: "फसल टिप्स",
    en: "Crop Tips",
  },
  action_irrigation: {
    gu: "સિંચાઈ",
    hi: "सिंचाई",
    en: "Irrigation",
  },
  action_pest_alert: {
    gu: "જીવાત ચેતવણી",
    hi: "कीट चेतावनी",
    en: "Pest Alert",
  },
  action_buy_products: {
    gu: "ઉત્પાદનો ખરીદો",
    hi: "उत्पाद खरीदें",
    en: "Buy Products",
  },

  // Weather Alert
  alert_red: {
    gu: "🔴 ભારે ખતરો",
    hi: "🔴 भारी खतरा",
    en: "🔴 Severe Danger",
  },
  alert_orange: {
    gu: "🟠 સાવધાન",
    hi: "🟠 सावधान",
    en: "🟠 Caution",
  },
  alert_yellow: {
    gu: "🟡 ચેતવણી",
    hi: "🟡 चेतावनी",
    en: "🟡 Warning",
  },
  alert_green: {
    gu: "🟢 સુરક્ષિત",
    hi: "🟢 सुरक्षित",
    en: "🟢 Safe",
  },
  weather_title: {
    gu: "આજે ભારે વરસાદ",
    hi: "आज भारी बारिश",
    en: "Heavy Rain Today",
  },
  weather_desc: {
    gu: "બપોર 2 થી 6 વાગ્યા સુધી ભારે વરસાદની શક્યતા. પાક ઢાંકી દો.",
    hi: "दोपहर 2 से 6 बजे तक भारी बारिश की संभावना। फसल ढक दें।",
    en: "Heavy rain likely from 2 PM to 6 PM. Cover your crops.",
  },

  // Bottom Nav
  nav_weather: {
    gu: "હવામાન",
    hi: "मौसम",
    en: "Weather",
  },
  nav_tips: {
    gu: "ટિપ્સ",
    hi: "टिप्स",
    en: "Tips",
  },
  nav_news: {
    gu: "સમાચાર",
    hi: "समाचार",
    en: "News",
  },
  nav_profile: {
    gu: "પ્રોફાઇલ",
    hi: "प्रोफ़ाइल",
    en: "Profile",
  },

  // Farming Tips
  tips_title: {
    gu: "🌿 ખેતી ટિપ્સ",
    hi: "🌿 खेती टिप्स",
    en: "🌿 Farming Tips",
  },
  tip_water_title: {
    gu: "💧 પાણી આપો",
    hi: "💧 पानी दें",
    en: "💧 Water Crops",
  },
  tip_water_desc: {
    gu: "સવારે 6 વાગ્યે પાણી આપો, બપોરે નહીં",
    hi: "सुबह 6 बजे पानी दें, दोपहर में नहीं",
    en: "Water at 6 AM, not in the afternoon",
  },
  tip_pest_title: {
    gu: "🐛 જીવાત ચેક",
    hi: "🐛 कीट जांच",
    en: "🐛 Pest Check",
  },
  tip_pest_desc: {
    gu: "પાંદડા નીચે જુઓ, સફેદ ડાઘ હોય તો દવા છાંટો",
    hi: "पत्तियों के नीचे देखें, सफ़ेद धब्बे हों तो दवा छिड़कें",
    en: "Check under leaves, spray if white spots found",
  },
  tip_harvest_title: {
    gu: "🌾 લણણી",
    hi: "🌾 कटाई",
    en: "🌾 Harvest",
  },
  tip_harvest_desc: {
    gu: "ઘઉં પીળા થાય ત્યારે 2 દિવસમાં કાપો",
    hi: "गेहूँ पीला हो जाए तो 2 दिन में काटें",
    en: "Cut wheat within 2 days when it turns yellow",
  },
  tip_fertilizer_title: {
    gu: "🌱 ખાતર",
    hi: "🌱 खाद",
    en: "🌱 Fertilizer",
  },
  tip_fertilizer_desc: {
    gu: "વાવણી પહેલાં છાણિયું ખાતર નાખો",
    hi: "बुआई से पहले गोबर की खाद डालें",
    en: "Add compost before sowing",
  },

  // News
  news_title: {
    gu: "📰 ખેતી સમાચાર",
    hi: "📰 खेती समाचार",
    en: "📰 Agriculture News",
  },
  news_1_title: {
    gu: "📢 ગુજરાત: MSP ઘઉંનો ભાવ ₹2275 પ્રતિ ક્વિન્ટલ જાહેર",
    hi: "📢 गुजरात: MSP गेहूँ का भाव ₹2275 प्रति क्विंटल घोषित",
    en: "📢 Gujarat: MSP for wheat declared ₹2275 per quintal",
  },
  news_1_source: { gu: "કૃષિ વિભાગ", hi: "कृषि विभाग", en: "Agriculture Dept" },
  news_1_time: { gu: "2 કલાક પહેલા", hi: "2 घंटे पहले", en: "2 hours ago" },
  news_2_title: {
    gu: "🚜 PM કિસાન યોજના: 17મો હપ્તો ટૂંક સમયમાં",
    hi: "🚜 PM किसान योजना: 17वीं किस्त जल्द",
    en: "🚜 PM Kisan Scheme: 17th installment soon",
  },
  news_2_source: { gu: "સરકારી યોજના", hi: "सरकारी योजना", en: "Government Scheme" },
  news_2_time: { gu: "5 કલાક પહેલા", hi: "5 घंटे पहले", en: "5 hours ago" },
  news_3_title: {
    gu: "🌧️ ચોમાસું સમયસર આવશે, IMD અનુમાન",
    hi: "🌧️ मानसून समय पर आएगा, IMD अनुमान",
    en: "🌧️ Monsoon on time, IMD forecast",
  },
  news_3_source: { gu: "હવામાન વિભાગ", hi: "मौसम विभाग", en: "Weather Dept" },
  news_3_time: { gu: "1 દિવસ પહેલા", hi: "1 दिन पहले", en: "1 day ago" },
  news_4_title: {
    gu: "🧪 માટી પરીક્ષણ મફત — નજીકની KVK પર",
    hi: "🧪 मिट्टी परीक्षण मुफ्त — नजदीकी KVK पर",
    en: "🧪 Free soil testing — at nearest KVK",
  },
  news_4_source: { gu: "કૃષિ કેન્દ્ર", hi: "कृषि केंद्र", en: "Agriculture Center" },
  news_4_time: { gu: "2 દિવસ પહેલા", hi: "2 दिन पहले", en: "2 days ago" },

  // Subscription
  sub_header_title: {
    gu: "સુરક્ષિત રહો. માહિતગાર રહો 🌾",
    hi: "सुरक्षित रहें। जानकार रहें 🌾",
    en: "Stay Safe. Stay Informed 🌾",
  },
  sub_header_subtitle: {
    gu: "રીઅલ-ટાઇમ હવામાન ચેતવણી, પાક ટિપ્સ અને ખેતી માર્ગદર્શન મેળવો",
    hi: "रीयल-टाइम मौसम अलर्ट, फसल टिप्स और खेती गाइडेंस पाएं",
    en: "Get real-time weather alerts, crop tips & farming guidance",
  },
  sub_day: { gu: "દિવસ", hi: "दिन", en: "day" },
  sub_month: { gu: "મહિનો", hi: "महीना", en: "month" },
  sub_just: { gu: "માત્ર", hi: "सिर्फ़", en: "Just" },
  sub_emotional_line: {
    gu: "કારણ કે તમારી મહેનત યોગ્ય સહારા લાયક છે",
    hi: "क्योंकि आपकी मेहनत सही साथ की हकदार है",
    en: "Because your hard work deserves the right support",
  },
  sub_best_value: {
    gu: "ખેડૂતો માટે શ્રેષ્ઠ કિંમત",
    hi: "किसानों के लिए सबसे अच्छी कीमत",
    en: "Best value for farmers",
  },
  sub_benefits_title: {
    gu: "તમને શું મળશે",
    hi: "आपको क्या मिलेगा",
    en: "What you get",
  },
  sub_benefit_1: {
    gu: "તાત્કાલિક હવામાન ચેતવણી (વરસાદ, તોફાન, ગરમી)",
    hi: "तुरंत मौसम अलर्ट (बारिश, तूफान, गर्मी)",
    en: "Instant Weather Alerts (Rain, Storm, Heat)",
  },
  sub_benefit_2: {
    gu: "પાક મુજબ સ્માર્ટ ખેતી ટિપ્સ",
    hi: "फसल के अनुसार स्मार्ट खेती टिप्स",
    en: "Crop-wise Smart Farming Tips",
  },
  sub_benefit_3: {
    gu: "જીવાત અને રોગ ચેતવણી",
    hi: "कीट और रोग अलर्ट",
    en: "Pest & Disease Alerts",
  },
  sub_benefit_4: {
    gu: "સ્થાન આધારિત સચોટ અપડેટ્સ",
    hi: "लोकेशन आधारित सटीक अपडेट",
    en: "Location-based accurate updates",
  },
  sub_benefit_5: {
    gu: "ડાયરેક્ટ ખેડૂત હેલ્પલાઇન સપોર્ટ",
    hi: "डायरेक्ट किसान हेल्पलाइन सपोर्ट",
    en: "Direct Farmer Helpline Support",
  },
  sub_trusted: {
    gu: "ભારતભરના હજારો ખેડૂતોનો વિશ્વાસ 🌾",
    hi: "भारत भर के हज़ारों किसानों का भरोसा 🌾",
    en: "Trusted by thousands of farmers across India 🌾",
  },
  sub_testimonial_1_name: {
    gu: "રમેશભાઈ, અમદાવાદ",
    hi: "रमेश भाई, अहमदाबाद",
    en: "Ramesh Bhai, Ahmedabad",
  },
  sub_testimonial_1_text: {
    gu: "વરસાદની ચેતવણીથી મારો પાક બચી ગયો!",
    hi: "बारिश की चेतावनी से मेरी फसल बच गई!",
    en: "Rain alert saved my entire crop!",
  },
  sub_testimonial_2_name: {
    gu: "જયાબેન, રાજકોટ",
    hi: "जया बहन, राजकोट",
    en: "Jaya Ben, Rajkot",
  },
  sub_testimonial_2_text: {
    gu: "દરરોજ ₹2 માં આટલી મદદ - ખૂબ સારું!",
    hi: "रोज़ ₹2 में इतनी मदद - बहुत बढ़िया!",
    en: "So much help for just ₹2/day - amazing!",
  },
  sub_cancel_anytime: {
    gu: "ગમે ત્યારે રદ કરો • કોઈ બંધન નહીં",
    hi: "कभी भी रद्द करें • कोई बंधन नहीं",
    en: "Cancel anytime • No commitment",
  },
  sub_cta: {
    gu: "હવે સબ્સ્ક્રાઇબ કરો",
    hi: "अभी सब्सक्राइब करें",
    en: "Subscribe Now",
  },
  sub_secure_payment: {
    gu: "સુરક્ષિત પેમેન્ટ • સરળ રદ",
    hi: "सुरक्षित भुगतान • आसान रद्दीकरण",
    en: "Secure payment • Easy cancellation",
  },
} as const;

type TranslationKey = keyof typeof translations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  tArray: (key: TranslationKey) => string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem("farmalert_lang") as Language) || "gu"
  );

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("farmalert_lang", lang);
  };

  const t = (key: TranslationKey): string => {
    const val = translations[key]?.[language];
    if (Array.isArray(val)) return (val as readonly string[]).join(", ");
    return (val as string) || key;
  };

  const tArray = (key: TranslationKey): string[] => {
    const val = translations[key]?.[language];
    if (Array.isArray(val)) return val as unknown as string[];
    return [];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, tArray }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

export const languageNames: Record<Language, string> = {
  gu: "ગુજરાતી",
  hi: "हिन्दी",
  en: "English",
};
