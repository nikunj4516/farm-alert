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

  // About Us
  nav_about: {
    gu: "અમારા વિશે",
    hi: "हमारे बारे में",
    en: "About Us",
  },
  about_tagline: {
    gu: "ડિજિટલ ખેતી",
    hi: "डिजिटल कृषि",
    en: "Digital Agriculture",
  },
  about_title_1: {
    gu: "સ્માર્ટ ટેકનોલોજી દ્વારા",
    hi: "स्मार्ट तकनीक के माध्यम से",
    en: "Empowering Farmers Through",
  },
  about_title_2: {
    gu: "ખેડૂતોનું સશક્તિકરણ",
    hi: "किसानों का सशक्तिकरण",
    en: "Smart Technology",
  },
  about_desc: {
    gu: "ફાર્મએલર્ટ સોલ્યુશન્સ પ્રા. લિ. ખેતી માટે આધુનિક ડિજિટલ ઉકેલો બનાવી રહી છે - ખેડૂતોને હવામાનની માહિતી, સ્માર્ટ ખેતીના સાધનો અને ભવિષ્યની સેવાઓ એક જ પ્લેટફોર્મ પર મેળવવામાં મદદ કરે છે.",
    hi: "फार्मअलर्ट सॉल्यूशंस प्राइवेट लिमिटेड कृषि के लिए आधुनिक डिजिटल समाधान बना रहा है - किसानों को मौसम की जानकारी, स्मार्ट खेती के उपकरण और भविष्य की सेवाएं एक ही प्लेटफॉर्म पर प्राप्त करने में मदद कर रहा है।",
    en: "Farmalert Solutions Pvt. Ltd. is building modern digital solutions for agriculture — helping farmers access weather insights, smart farming tools, quality products, and future-ready services in one platform.",
  },
  about_explore: {
    gu: "સેવાઓ જુઓ",
    hi: "सेवाएं देखें",
    en: "Explore Services",
  },
  about_join: {
    gu: "ખેડૂત નેટવર્કમાં જોડાઓ",
    hi: "किसान नेटवर्क से जुड़ें",
    en: "Join Farmers Network",
  },
  about_who_we_are: {
    gu: "અમે કોણ છીએ",
    hi: "हम कौन हैं",
    en: "Who We Are",
  },
  about_who_desc_1: {
    gu: "ફાર્મએલર્ટ સોલ્યુશન્સ પ્રા. લિ. એ ખેતી પર કેન્દ્રિત ટેકનોલોજી સ્ટાર્ટઅપ છે, જેનો ઉદ્દેશ્ય ડિજિટલ નવીનીકરણ દ્વારા ખેતીને સરળ બનાવવાનો છે.",
    hi: "फार्मअलर्ट सॉल्यूशंस प्राइवेट लिमिटेड एक कृषि-केंद्रित प्रौद्योगिकी स्टार्टअप है जिसे डिजिटल नवाचार का उपयोग करके खेती को सरल बनाने के दृष्टिकोण के साथ बनाया गया है।",
    en: "Farmalert Solutions Pvt. Ltd. is an agriculture-focused technology startup created with a vision to simplify farming using digital innovation.",
  },
  about_who_desc_2: {
    gu: "અમારું લક્ષ્ય ખેડૂતો અને ટેકનોલોજી વચ્ચેનું અંતર ઘટાડવાનું છે.",
    hi: "हमारा उद्देश्य किसानों और प्रौद्योगिकी के बीच की खाई को पाटना है।",
    en: "We aim to bridge the gap between farmers and technology by providing practical, affordable, and easy-to-use solutions that support daily agricultural needs.",
  },
  about_who_desc_3: {
    gu: "હવામાનની ચેતવણીઓ અને પાકના અપડેટ્સથી લઈને કૃષિ સેવાઓ અને ભવિષ્યના ઈ-કોમર્સ સપોર્ટ સુધી, અમારું લક્ષ્ય દરેક ખેડૂત માટે કનેક્ટેડ ખેતી ઇકોસિસ્ટમ બનાવવાનું છે.",
    hi: "मौसम अलर्ट और फसल अपडेट से लेकर कृषि सेवाओं और भविष्य के ई-कॉमर्स समर्थन तक, हमारा मिशन हर किसान के लिए एक जुड़ा हुआ कृषि पारिस्थितिकी तंत्र बनाना है।",
    en: "From weather alerts and crop updates to agriculture services and future e-commerce support, our mission is to create a connected farming ecosystem for every farmer.",
  },
  about_vision_title: { gu: "અમારું વિઝન", hi: "हमारा दृष्टिकोण", en: "Our Vision" },
  about_vision_desc: {
    gu: "એક સ્માર્ટ અને ડિજિટલી કનેક્ટેડ એગ્રીકલ્ચર ઇકોસિસ્ટમ બનાવવી જે દરેક ખેડૂતને સુલભ ટેકનોલોજી વડે સશક્ત બનાવે છે.",
    hi: "एक स्मार्ट और डिजिटल रूप से जुड़ा कृषि पारिस्थितिकी तंत्र बनाने के लिए जो हर किसान को सुलभ तकनीक से सशक्त बनाता है।",
    en: "To build a smarter and digitally connected agriculture ecosystem that empowers every farmer with accessible technology.",
  },
  about_mission_title: { gu: "અમારું મિશન", hi: "हमारा मिशन", en: "Our Mission" },
  about_mission_desc: {
    gu: "નવીનતા, સરળતા અને ખેડૂત-કેન્દ્રિત ડિજિટલ સેવાઓ દ્વારા વિશ્વસનીય કૃષિ ઉકેલો પ્રદાન કરવા.",
    hi: "नवाचार, सरलता और किसान-केंद्रित डिजिटल सेवाओं के माध्यम से विश्वसनीय कृषि समाधान प्रदान करने के लिए।",
    en: "To provide trusted agriculture solutions through innovation, simplicity, and farmer-focused digital services.",
  },
  about_why_choose: { gu: "અમને શા માટે પસંદ કરો", hi: "हमें क्यों चुनें", en: "Why Choose Us" },
  feature_weather: { gu: "સ્માર્ટ હવામાન ચેતવણી", hi: "स्मार्ट मौसम अलर्ट", en: "Smart Weather Alerts" },
  feature_interface: { gu: "ખેડૂત-મિત્ર ઇન્ટરફેસ", hi: "किसान-अनुकूल इंटरफेस", en: "Farmer-Friendly Interface" },
  feature_affordable: { gu: "પોસાય તેવી ડિજિટલ સેવાઓ", hi: "किफायती डिजिटल सेवाएं", en: "Affordable Digital Services" },
  feature_innovation: { gu: "કૃષિ-કેન્દ્રિત નવીનતા", hi: "कृषि-केंद्रित नवाचार", en: "Agriculture-Focused Innovation" },
  feature_future: { gu: "ભવિષ્ય-તૈયાર ટેકનોલોજી", hi: "भविष्य के लिए तैयार तकनीक", en: "Future-Ready Technology" },
  feature_support: { gu: "વિશ્વસનીય સપોર્ટ સિસ્ટમ", hi: "विश्वसनीय समर्थन प्रणाली", en: "Trusted Support System" },
  about_founder_title: { gu: "સ્થાપકને મળો", hi: "संस्थापक से मिलें", en: "Meet The Founder" },
  founder_name: { gu: "નિકુંજ બારિયા", hi: "निकुंज बारिया", en: "Nikunj Bariya" },
  founder_role: { gu: "સહ-સ્થાપક અને મોબાઇલ એપ્લિકેશન ડેવલપર", hi: "सह-संस्थापक और मोबाइल एप्लिकेशन डेवलपर", en: "Co-Founder & Mobile Application Developer" },
  founder_desc: {
    gu: "ટેક્નોલોજી અને નવીનતા પ્રત્યે જુસ્સાદાર, નિકુંજ બારિયાએ ડિજિટલ સોલ્યુશન્સ દ્વારા કૃષિને આધુનિક બનાવવાના વિઝન સાથે ફાર્મએલર્ટની શરૂઆત કરી જે સમગ્ર ભારતમાં ખેડૂતો માટે વ્યવહારુ, માપી શકાય તેવા અને સુલભ છે.",
    hi: "प्रौद्योगिकी और नवाचार के प्रति जुनूनी, निकुंज बारिया ने डिजिटल समाधानों के माध्यम से कृषि को आधुनिक बनाने के दृष्टिकोण के साथ फार्मअलर्ट की शुरुआत की, जो पूरे भारत में किसानों के लिए व्यावहारिक, स्केलेबल और सुलभ हैं।",
    en: "Passionate about technology and innovation, Nikunj Bariya started Farmalert with a vision to modernize agriculture through digital solutions that are practical, scalable, and accessible for farmers across India.",
  },
  founder_quote: {
    gu: "ટેક્નોલોજીએ એવા લોકોને ટેકો આપવો જોઈએ જેઓ વિશ્વનું ભરણપોષણ કરે છે.",
    hi: "प्रौद्योगिकी को उन लोगों का समर्थन करना चाहिए जो दुनिया का पेट भरते हैं।",
    en: "Technology should support the people who feed the world.",
  },
  footer_text: {
    gu: "સ્માર્ટ, સુલભ અને વિશ્વસનીય ડિજિટલ ટેકનોલોજી દ્વારા કૃષિને સશક્ત બનાવવી.",
    hi: "स्मार्ट, सुलभ और विश्वसनीय डिजिटल तकनीक के माध्यम से कृषि को सशक्त बनाना।",
    en: "Empowering agriculture through smart, accessible, and trusted digital technology.",
  },
  footer_rights: {
    gu: "ફાર્મએલર્ટ. સર્વાધિકાર સુરક્ષિત.",
    hi: "फार्मअलर्ट। सर्वाधिकार सुरक्षित。",
    en: "FarmAlert. All rights reserved.",
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
