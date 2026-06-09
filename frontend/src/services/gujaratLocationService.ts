import type { Language } from "@/contexts/LanguageContext";
import villageHierarchy from "@/data/gujaratVillageHierarchy.json";
import { getVillageCoordinates } from "@/data/gujaratVillageCoordinates";

export interface GujaratDistrict {
  name: string;
  gu: string;
  hi: string;
  center: { latitude: number; longitude: number };
  talukas: string[];
  villages?: string[];
}

export interface ValidatedGujaratLocation {
  village: string | null;
  taluka: string | null;
  district: string | null;
  state: "Gujarat";
  latitude: number | null;
  longitude: number | null;
  confidence: "manual" | "taluka" | "district" | "fallback";
}

const LOCATION_STORAGE_KEY = "farmalert_profile_location";
const villageHierarchyByDistrict = villageHierarchy as Record<string, Record<string, string[]>>;

export const GUJARAT_TALUKA_COORDINATES: Record<string, { name: string; district: string; latitude: number; longitude: number }> = {
  jambughoda: { name: "Jambughoda", district: "Panchmahal", latitude: 22.3667, longitude: 73.7333 },
  godhra: { name: "Godhra", district: "Panchmahal", latitude: 22.7755, longitude: 73.6149 },
  halol: { name: "Halol", district: "Panchmahal", latitude: 22.5036, longitude: 73.4728 },
  kalol: { name: "Kalol", district: "Panchmahal", latitude: 22.6077, longitude: 73.4633 },
  balasinor: { name: "Balasinor", district: "Mahisagar", latitude: 22.9559, longitude: 73.3365 },
  kadana: { name: "Kadana", district: "Mahisagar", latitude: 23.2824, longitude: 73.8442 },
  khanpur: { name: "Khanpur", district: "Mahisagar", latitude: 23.2924, longitude: 73.6156 },
  lunawada: { name: "Lunawada", district: "Mahisagar", latitude: 23.1284, longitude: 73.6105 },
  santrampur: { name: "Santrampur", district: "Mahisagar", latitude: 23.1892, longitude: 73.8960 },
  virpur: { name: "Virpur", district: "Mahisagar", latitude: 23.1862, longitude: 73.4798 },
  anand: { name: "Anand", district: "Anand", latitude: 22.5645, longitude: 72.9289 },
  borsad: { name: "Borsad", district: "Anand", latitude: 22.4079, longitude: 72.8982 },
  petlad: { name: "Petlad", district: "Anand", latitude: 22.4768, longitude: 72.8006 },
  umreth: { name: "Umreth", district: "Anand", latitude: 22.6988, longitude: 73.1156 },
  vadodara: { name: "Vadodara", district: "Vadodara", latitude: 22.3072, longitude: 73.1812 },
  dabhoi: { name: "Dabhoi", district: "Vadodara", latitude: 22.1836, longitude: 73.4336 },
  desar: { name: "Desar", district: "Vadodara", latitude: 22.6814, longitude: 73.2477 },
  karjan: { name: "Karjan", district: "Vadodara", latitude: 22.0536, longitude: 73.1230 },
  padra: { name: "Padra", district: "Vadodara", latitude: 22.2380, longitude: 73.0840 },
  savli: { name: "Savli", district: "Vadodara", latitude: 22.5608, longitude: 73.2214 },
  vaghodia: { name: "Vaghodia", district: "Vadodara", latitude: 22.3055, longitude: 73.3977 },
  ahmedabad: { name: "Ahmedabad", district: "Ahmedabad", latitude: 23.0225, longitude: 72.5714 },
  sanand: { name: "Sanand", district: "Ahmedabad", latitude: 22.9920, longitude: 72.3810 },
  dholka: { name: "Dholka", district: "Ahmedabad", latitude: 22.7273, longitude: 72.4413 },
  surat: { name: "Surat", district: "Surat", latitude: 21.1702, longitude: 72.8311 },
  bardoli: { name: "Bardoli", district: "Surat", latitude: 21.1220, longitude: 73.1115 },
  rajkot: { name: "Rajkot", district: "Rajkot", latitude: 22.3039, longitude: 70.8022 },
  gondal: { name: "Gondal", district: "Rajkot", latitude: 21.9619, longitude: 70.7927 },
};


const placeLabels: Record<string, { gu: string; hi: string }> = {
  Gujarat: { gu: "ગુજરાત", hi: "गुजरात" },
  Jambughoda: { gu: "જાંબુઘોડા", hi: "जांबुघोड़ा" },
  Rampura: { gu: "રામપુરા", hi: "रामपुरा" },
  Bhanpura: { gu: "ભાણપુરા", hi: "भानपुरा" },
  Narukot: { gu: "નારુકોટ", hi: "नारूकोट" },
  Halol: { gu: "હાલોલ", hi: "हालोल" },
  Ravaliya: { gu: "રવાળિયા", hi: "रवलिया" },
  Vavdi: { gu: "વાવડી", hi: "वावड़ी" },
  Baska: { gu: "બાસ્કા", hi: "बास्का" },
  Kalol: { gu: "કલોલ", hi: "कलोल" },
  Arad: { gu: "અરાડ", hi: "अराड" },
  Delol: { gu: "દેલોલ", hi: "देलोल" },
  Alindra: { gu: "અલીન્દ્રા", hi: "अलिंद्रा" },
  Godhra: { gu: "ગોધરા", hi: "गोधरा" },
  Vadodara: { gu: "વડોદરા", hi: "वडोदरा" },
  Dabhoi: { gu: "ડભોઇ", hi: "डभोई" },
  Desar: { gu: "ડેસર", hi: "डेसर" },
  Karjan: { gu: "કરજણ", hi: "करजन" },
  Padra: { gu: "પાદરા", hi: "पादरा" },
  Savli: { gu: "સાવલી", hi: "सावली" },
  Shinor: { gu: "શિનોર", hi: "शिनोर" },
  Vaghodia: { gu: "વાઘોડિયા", hi: "वाघोडिया" },
  Bajwa: { gu: "બાજવા", hi: "बाजवा" },
  Harni: { gu: "હરણી", hi: "हरनी" },
  Sevasi: { gu: "સેવાસી", hi: "सेवासी" },
  Tarsali: { gu: "તરસાલી", hi: "तरसाली" },
  Kayavarohan: { gu: "કાયાવરોહણ", hi: "कायावरोहण" },
  Thuvavi: { gu: "થુવાવી", hi: "थुवावी" },
  Anand: { gu: "આણંદ", hi: "आणंद" },
  Anklav: { gu: "આંકલાવ", hi: "आंकलाव" },
  Borsad: { gu: "બોરસદ", hi: "बोरसद" },
  Vasad: { gu: "વાસદ", hi: "वासद" },
  Petlad: { gu: "પેટલાદ", hi: "पेटलाद" },
  Sojitra: { gu: "સોજીત્રા", hi: "सोजित्रा" },
  Tarapur: { gu: "તારાપુર", hi: "तारापुर" },
  Umreth: { gu: "ઉમરેઠ", hi: "उमरेठ" },
  Karamsad: { gu: "કરમસદ", hi: "करमसद" },
  Mogri: { gu: "મોગરી", hi: "मोगरी" },
  "Vallabh Vidyanagar": { gu: "વલ્લભ વિદ્યાનગર", hi: "वल्लभ विद्यानगर" },
  "Chhota Udepur": { gu: "છોટા ઉદેપુર", hi: "छोटा उदेपुर" },
  Bodeli: { gu: "બોડેલી", hi: "बोडेली" },
  Kavant: { gu: "કવાંટ", hi: "कवांट" },
  Nasvadi: { gu: "નસવાડી", hi: "नसवाड़ी" },
  Sankheda: { gu: "સંખેડા", hi: "संखेड़ा" },
  "Jetpur Pavi": { gu: "જેતપુર પાવી", hi: "जेतपुर पावी" },
  Raski: { gu: "રાસ્કી", hi: "रास्की" },
  Ahmedabad: { gu: "અમદાવાદ", hi: "अहमदाबाद" },
  "Ahmedabad City": { gu: "અમદાવાદ શહેર", hi: "अहमदाबाद शहर" },
  Daskroi: { gu: "દસ્ક્રોઇ", hi: "दस्क्रोई" },
  Dhandhuka: { gu: "ધંધુકા", hi: "धंधुका" },
  Bavla: { gu: "બાવળા", hi: "बावला" },
  Viramgam: { gu: "વિરમગામ", hi: "वीरमगाम" },
  Sanand: { gu: "સાણંદ", hi: "सानंद" },
  Dholka: { gu: "ધોળકા", hi: "धोलका" },
  Mandal: { gu: "મંડલ", hi: "मंडल" },
  "Detroj-Rampura": { gu: "દેત્રોજ-રામપુરા", hi: "देत्रोज-रामपुरा" },
  Surat: { gu: "સુરત", hi: "सूरत" },
  Bardoli: { gu: "બારડોલી", hi: "बारडोली" },
  Choryasi: { gu: "ચોર્યાસી", hi: "चौर्यासी" },
  Kamrej: { gu: "કામરેજ", hi: "कामरेज" },
  Mahuva: { gu: "મહુવા", hi: "महुवा" },
  Mandvi: { gu: "માંડવી", hi: "मांडवी" },
  Mangrol: { gu: "માંગરોળ", hi: "मांगरोल" },
  Olpad: { gu: "ઓલપાડ", hi: "ओलपाड" },
  Palsana: { gu: "પલસાણા", hi: "पलसाना" },
  "Surat City": { gu: "સુરત શહેર", hi: "सूरत शहर" },
  Umarpada: { gu: "ઉમરપાડા", hi: "उमरपाड़ा" },
  Rajkot: { gu: "રાજકોટ", hi: "राजकोट" },
  Gondal: { gu: "ગોંડલ", hi: "गोंडल" },
  Dhoraji: { gu: "ધોરાજી", hi: "धोराजी" },
  Jamkandorna: { gu: "જામકંડોરણા", hi: "जामकंडोरणा" },
  Jasdan: { gu: "જસદણ", hi: "जसदण" },
  Jetpur: { gu: "જેતપુર", hi: "जेतपुर" },
  "Kotda Sangani": { gu: "કોટડા સાંગાણી", hi: "कोटडा सांगानी" },
  Lodhika: { gu: "લોધિકા", hi: "लोधिका" },
  Paddhari: { gu: "પડધરી", hi: "पडधरी" },
  Upleta: { gu: "ઉપલેટા", hi: "उपलेटा" },
  Vinchhiya: { gu: "વિંછિયા", hi: "विंछिया" },
  Mehsana: { gu: "મહેસાણા", hi: "मेहसाणा" },
  Becharaji: { gu: "બેચરાજી", hi: "बेचराजी" },
  Jotana: { gu: "જોટાણા", hi: "जोटाणा" },
  Kadi: { gu: "કડી", hi: "कडी" },
  Kheralu: { gu: "ખેરાલુ", hi: "खेरालु" },
  Satlasana: { gu: "સતલાસણા", hi: "सतलासणा" },
  Unjha: { gu: "ઊંઝા", hi: "ऊंझा" },
  Vadnagar: { gu: "વડનગર", hi: "वडनगर" },
  Vijapur: { gu: "વિજાપુર", hi: "विजापुर" },
  Visnagar: { gu: "વિસનગર", hi: "विसनगर" },
  Balasinor: { gu: "બાલાસિનોર", hi: "बालासिनोर" },
  Kadana: { gu: "કડાણા", hi: "कडाना" },
  Khanpur: { gu: "ખાનપુર", hi: "खानपुर" },
  Lunawada: { gu: "લુણાવાડા", hi: "लुनावाडा" },
  Santrampur: { gu: "સંતરામપુર", hi: "संतरामपुर" },
  Virpur: { gu: "વીરપુર", hi: "वीरपुर" },
};

const gujaratiSyllables: Array<[RegExp, string]> = [
  [/chh/gi, "છ"],
  [/kh/gi, "ખ"],
  [/gh/gi, "ઘ"],
  [/dh/gi, "ધ"],
  [/bh/gi, "ભ"],
  [/ph/gi, "ફ"],
  [/th/gi, "થ"],
  [/sh/gi, "શ"],
  [/aa/gi, "ા"],
  [/ee/gi, "ી"],
  [/oo/gi, "ૂ"],
  [/ai/gi, "ૈ"],
  [/au/gi, "ૌ"],
  [/a/gi, "ા"],
  [/b/gi, "બ"],
  [/c/gi, "ક"],
  [/d/gi, "દ"],
  [/e/gi, "ે"],
  [/f/gi, "ફ"],
  [/g/gi, "ગ"],
  [/h/gi, "હ"],
  [/i/gi, "િ"],
  [/j/gi, "જ"],
  [/k/gi, "ક"],
  [/l/gi, "લ"],
  [/m/gi, "મ"],
  [/n/gi, "ન"],
  [/o/gi, "ો"],
  [/p/gi, "પ"],
  [/q/gi, "ક"],
  [/r/gi, "ર"],
  [/s/gi, "સ"],
  [/t/gi, "ત"],
  [/u/gi, "ુ"],
  [/v/gi, "વ"],
  [/w/gi, "વ"],
  [/x/gi, "ક્સ"],
  [/y/gi, "ય"],
  [/z/gi, "ઝ"],
];

const hindiSyllables: Array<[RegExp, string]> = [
  [/chh/gi, "छ"],
  [/kh/gi, "ख"],
  [/gh/gi, "घ"],
  [/dh/gi, "ध"],
  [/bh/gi, "भ"],
  [/ph/gi, "फ"],
  [/th/gi, "थ"],
  [/sh/gi, "श"],
  [/aa/gi, "ा"],
  [/ee/gi, "ी"],
  [/oo/gi, "ू"],
  [/ai/gi, "ै"],
  [/au/gi, "ौ"],
  [/a/gi, "ा"],
  [/b/gi, "ब"],
  [/c/gi, "क"],
  [/d/gi, "द"],
  [/e/gi, "े"],
  [/f/gi, "फ"],
  [/g/gi, "ग"],
  [/h/gi, "ह"],
  [/i/gi, "ि"],
  [/j/gi, "ज"],
  [/k/gi, "क"],
  [/l/gi, "ल"],
  [/m/gi, "म"],
  [/n/gi, "न"],
  [/o/gi, "ो"],
  [/p/gi, "प"],
  [/q/gi, "क"],
  [/r/gi, "र"],
  [/s/gi, "स"],
  [/t/gi, "त"],
  [/u/gi, "ु"],
  [/v/gi, "व"],
  [/w/gi, "व"],
  [/x/gi, "क्स"],
  [/y/gi, "य"],
  [/z/gi, "ज"],
];

const transliterateFallback = (value: string, language: Language) => {
  if (language === "en") return value;
  const rules = language === "gu" ? gujaratiSyllables : hindiSyllables;
  return value
    .split(/(\s+|-)/)
    .map((part) => {
      if (/^\s+$|^-$/u.test(part)) return part;
      return rules.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), part);
    })
    .join("");
};

export const GUJARAT_DISTRICTS: GujaratDistrict[] = [
  { name: "Ahmedabad", gu: "અમદાવાદ", hi: "अहमदाबाद", center: { latitude: 23.0225, longitude: 72.5714 }, talukas: ["Ahmedabad City", "Daskroi", "Dholka", "Dhandhuka", "Bavla", "Viramgam", "Sanand", "Mandal", "Detroj-Rampura"], villages: ["Sanand", "Bavla", "Dholka", "Viramgam"] },
  { name: "Amreli", gu: "અમરેલી", hi: "अमरेली", center: { latitude: 21.6032, longitude: 71.2221 }, talukas: ["Amreli", "Babra", "Bagasara", "Dhari", "Jafrabad", "Khambha", "Kunkavav Vadia", "Lathi", "Lilia", "Rajula", "Savarkundla"] },
  { name: "Anand", gu: "આણંદ", hi: "आणंद", center: { latitude: 22.5645, longitude: 72.9289 }, talukas: ["Anand", "Anklav", "Borsad", "Khambhat", "Petlad", "Sojitra", "Tarapur", "Umreth"], villages: ["Vasad", "Borsad", "Karamsad", "Petlad", "Sojitra"] },
  { name: "Aravalli", gu: "અરવલ્લી", hi: "अरावली", center: { latitude: 23.4622, longitude: 73.2986 }, talukas: ["Bayad", "Bhiloda", "Dhansura", "Malpur", "Meghraj", "Modasa"] },
  { name: "Banaskantha", gu: "બનાસકાંઠા", hi: "बनासकांठा", center: { latitude: 24.1722, longitude: 72.4384 }, talukas: ["Amirgadh", "Bhabhar", "Danta", "Dantiwada", "Deesa", "Deodar", "Dhanera", "Kankrej", "Lakhani", "Palanpur", "Suigam", "Tharad", "Vadgam", "Vav"] },
  { name: "Bharuch", gu: "ભરૂચ", hi: "भरूच", center: { latitude: 21.7051, longitude: 72.9959 }, talukas: ["Amod", "Ankleshwar", "Bharuch", "Hansot", "Jambusar", "Jhagadia", "Netrang", "Vagra", "Valia"] },
  { name: "Bhavnagar", gu: "ભાવનગર", hi: "भावनगर", center: { latitude: 21.7645, longitude: 72.1519 }, talukas: ["Bhavnagar", "Gariadhar", "Ghogha", "Jesar", "Mahuva", "Palitana", "Sihor", "Talaja", "Umrala", "Vallabhipur"] },
  { name: "Botad", gu: "બોટાદ", hi: "बोटाद", center: { latitude: 22.1704, longitude: 71.6684 }, talukas: ["Barwala", "Botad", "Gadhada", "Ranpur"] },
  { name: "Chhota Udepur", gu: "છોટા ઉદેપુર", hi: "छोटा उदेपुर", center: { latitude: 22.3047, longitude: 74.0158 }, talukas: ["Bodeli", "Chhota Udepur", "Jetpur Pavi", "Kavant", "Nasvadi", "Sankheda"], villages: ["Raski", "Bodeli", "Kavant"] },
  { name: "Dahod", gu: "દાહોદ", hi: "दाहोद", center: { latitude: 22.8345, longitude: 74.2606 }, talukas: ["Dahod", "Devgad Baria", "Dhanpur", "Fatepura", "Garbada", "Jhalod", "Limkheda", "Sanjeli", "Singvad"] },
  { name: "Dang", gu: "ડાંગ", hi: "डांग", center: { latitude: 20.7579, longitude: 73.6863 }, talukas: ["Ahwa", "Subir", "Waghai"] },
  { name: "Devbhoomi Dwarka", gu: "દેવભૂમિ દ્વારકા", hi: "देवभूमि द्वारका", center: { latitude: 22.2394, longitude: 68.9678 }, talukas: ["Bhanvad", "Kalyanpur", "Khambhalia", "Okhamandal"] },
  { name: "Gandhinagar", gu: "ગાંધીનગર", hi: "गांधीनगर", center: { latitude: 23.2156, longitude: 72.6369 }, talukas: ["Dehgam", "Gandhinagar", "Kalol", "Mansa"] },
  { name: "Gir Somnath", gu: "ગીર સોમનાથ", hi: "गिर सोमनाथ", center: { latitude: 20.9159, longitude: 70.3629 }, talukas: ["Gir Gadhada", "Kodinar", "Sutrapada", "Talala", "Una", "Veraval"] },
  { name: "Jamnagar", gu: "જામનગર", hi: "जामनगर", center: { latitude: 22.4707, longitude: 70.0577 }, talukas: ["Dhrol", "Jamjodhpur", "Jamnagar", "Jodiya", "Kalavad", "Lalpur"] },
  { name: "Junagadh", gu: "જૂનાગઢ", hi: "जूनागढ़", center: { latitude: 21.5222, longitude: 70.4579 }, talukas: ["Bhesan", "Junagadh", "Keshod", "Malia Hatina", "Manavadar", "Mangrol", "Mendarda", "Vanthali", "Visavadar"] },
  { name: "Kheda", gu: "ખેડા", hi: "खेड़ा", center: { latitude: 22.7507, longitude: 72.6847 }, talukas: ["Galteshwar", "Kapadvanj", "Kathlal", "Kheda", "Mahudha", "Matar", "Mehmedabad", "Nadiad", "Thasra", "Vaso"] },
  { name: "Kutch", gu: "કચ્છ", hi: "कच्छ", center: { latitude: 23.7337, longitude: 69.8597 }, talukas: ["Abdasa", "Anjar", "Bhachau", "Bhuj", "Gandhidham", "Lakhpat", "Mandvi", "Mundra", "Nakhatrana", "Rapar"] },
  { name: "Mahisagar", gu: "મહીસાગર", hi: "महीसागर", center: { latitude: 23.1714, longitude: 73.5594 }, talukas: ["Balasinor", "Kadana", "Khanpur", "Lunawada", "Santrampur", "Virpur"] },
  { name: "Mehsana", gu: "મહેસાણા", hi: "मेहसाणा", center: { latitude: 23.5879, longitude: 72.3693 }, talukas: ["Becharaji", "Jotana", "Kadi", "Kheralu", "Mehsana", "Satlasana", "Unjha", "Vadnagar", "Vijapur", "Visnagar"] },
  { name: "Morbi", gu: "મોરબી", hi: "मोरबी", center: { latitude: 22.8173, longitude: 70.8377 }, talukas: ["Halvad", "Maliya", "Morbi", "Tankara", "Wankaner"] },
  { name: "Narmada", gu: "નર્મદા", hi: "नर्मदा", center: { latitude: 21.8706, longitude: 73.5024 }, talukas: ["Dediapada", "Garudeshwar", "Nandod", "Sagbara", "Tilakwada"] },
  { name: "Navsari", gu: "નવસારી", hi: "नवसारी", center: { latitude: 20.9467, longitude: 72.9520 }, talukas: ["Chikhli", "Gandevi", "Jalalpore", "Khergam", "Navsari", "Vansda"] },
  { name: "Panchmahal", gu: "પંચમહાલ", hi: "पंचमहाल", center: { latitude: 22.7755, longitude: 73.6149 }, talukas: ["Ghoghamba", "Godhra", "Halol", "Jambughoda", "Kalol", "Morwa Hadaf", "Shehera"], villages: ["Rampura", "Jambughoda", "Godhra", "Halol"] },
  { name: "Patan", gu: "પાટણ", hi: "पाटन", center: { latitude: 23.8500, longitude: 72.1167 }, talukas: ["Chanasma", "Harij", "Patan", "Radhanpur", "Sami", "Sankheswar", "Santalpur", "Saraswati", "Sidhpur"] },
  { name: "Porbandar", gu: "પોરબંદર", hi: "पोरबंदर", center: { latitude: 21.6417, longitude: 69.6293 }, talukas: ["Kutiyana", "Porbandar", "Ranavav"] },
  { name: "Rajkot", gu: "રાજકોટ", hi: "राजकोट", center: { latitude: 22.3039, longitude: 70.8022 }, talukas: ["Dhoraji", "Gondal", "Jamkandorna", "Jasdan", "Jetpur", "Kotda Sangani", "Lodhika", "Paddhari", "Rajkot", "Upleta", "Vinchhiya"] },
  { name: "Sabarkantha", gu: "સાબરકાંઠા", hi: "साबरकांठा", center: { latitude: 23.5986, longitude: 72.9630 }, talukas: ["Himatnagar", "Idar", "Khedbrahma", "Poshina", "Prantij", "Talod", "Vadali", "Vijaynagar"] },
  { name: "Surat", gu: "સુરત", hi: "सूरत", center: { latitude: 21.1702, longitude: 72.8311 }, talukas: ["Bardoli", "Choryasi", "Kamrej", "Mahuva", "Mandvi", "Mangrol", "Olpad", "Palsana", "Surat City", "Umarpada"] },
  { name: "Surendranagar", gu: "સુરેન્દ્રનગર", hi: "सुरेंद्रनगर", center: { latitude: 22.7201, longitude: 71.6495 }, talukas: ["Chotila", "Chuda", "Dasada", "Dhrangadhra", "Lakhtar", "Limbdi", "Muli", "Sayla", "Thangadh", "Wadhwan"] },
  { name: "Tapi", gu: "તાપી", hi: "तापी", center: { latitude: 21.1107, longitude: 73.3933 }, talukas: ["Dolvan", "Kukarmunda", "Nizar", "Songadh", "Uchchhal", "Valod", "Vyara"] },
  { name: "Vadodara", gu: "વડોદરા", hi: "वडोदरा", center: { latitude: 22.3072, longitude: 73.1812 }, talukas: ["Dabhoi", "Desar", "Karjan", "Padra", "Savli", "Shinor", "Vadodara", "Vaghodia"], villages: ["Vasad", "Karjan", "Dabhoi"] },
  { name: "Valsad", gu: "વલસાડ", hi: "वलसाड", center: { latitude: 20.5992, longitude: 72.9342 }, talukas: ["Dharampur", "Kaprada", "Pardi", "Umbergaon", "Valsad", "Vapi"] },
];

const normalize = (value?: string | null) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0A80-\u0AFF\u0900-\u097F]+/g, " ")
    .trim();

export const getDistrictLabel = (district: GujaratDistrict | string, language: Language = "en") => {
  const record = typeof district === "string" ? findDistrict(district) : district;
  if (!record) return typeof district === "string" ? district : "";
  return language === "gu" ? record.gu : language === "hi" ? record.hi : record.name;
};

export const getLocationLabel = (value?: string | null, language: Language = "en") => {
  if (!value) return "";
  if (language === "en") return value;

  const district = findDistrict(value);
  if (district) return getDistrictLabel(district, language);

  const label = placeLabels[value];
  return language === "gu" ? label?.gu || transliterateFallback(value, language) : label?.hi || transliterateFallback(value, language);
};

export const findDistrict = (value?: string | null) => {
  const key = normalize(value);
  if (!key) return null;
  return GUJARAT_DISTRICTS.find((district) =>
    [district.name, district.gu, district.hi].some((name) => normalize(name) === key || normalize(name).includes(key) || key.includes(normalize(name)))
  ) || null;
};

export const findDistrictByTaluka = (taluka?: string | null) => {
  const key = normalize(taluka);
  if (!key) return null;
  return GUJARAT_DISTRICTS.find((district) => district.talukas.some((item) => normalize(item) === key)) || null;
};

export const findTaluka = (districtName?: string | null, taluka?: string | null) => {
  const district = findDistrict(districtName) || findDistrictByTaluka(taluka);
  const key = normalize(taluka);
  if (!district || !key) return null;
  return district.talukas.find((item) => normalize(item) === key || normalize(item).includes(key) || key.includes(normalize(item))) || null;
};

export const validateGujaratLocation = (input: {
  village?: string | null;
  taluka?: string | null;
  district?: string | null;
  state?: string | null;
}): ValidatedGujaratLocation => {
  const talukaDistrict = findDistrictByTaluka(input.taluka);
  const district = findDistrict(input.district) || talukaDistrict;
  const taluka = findTaluka(district?.name, input.taluka) || null;
  
  let village = input.village?.trim() || null;
  if (!village && taluka && district) {
    const villages = getVillagesForTaluka(district.name, taluka);
    if (villages.length > 0) {
      village = villages[0];
    }
  }

  let latitude: number | null = null;
  let longitude: number | null = null;
  let confidence: ValidatedGujaratLocation["confidence"] = "fallback";

  // Multi-level fallback: Village -> Taluka -> District
  if (village && taluka && district) {
    const coords = getVillageCoordinates(district.name, taluka, village);
    if (coords) {
      latitude = coords.latitude;
      longitude = coords.longitude;
      confidence = "manual"; // village level
    }
  }

  if (latitude === null && taluka && district) {
    const key = String(taluka).toLowerCase();
    const talukaCoords = GUJARAT_TALUKA_COORDINATES[key];
    if (talukaCoords) {
      latitude = talukaCoords.latitude;
      longitude = talukaCoords.longitude;
      confidence = "taluka";
    }
  }

  if (latitude === null && district) {
    latitude = district.center.latitude;
    longitude = district.center.longitude;
    confidence = "district";
  }

  return {
    village,
    taluka,
    district: district?.name || null,
    state: "Gujarat",
    latitude,
    longitude,
    confidence,
  };
};


export const getTalukasForDistrict = (districtName?: string | null) => findDistrict(districtName)?.talukas || [];

export const getVillagesForDistrict = (districtName?: string | null) => findDistrict(districtName)?.villages || [];

export const getVillagesForTaluka = (districtName?: string | null, taluka?: string | null) => {
  const district = findDistrict(districtName);
  if (!district || !taluka) return [];
  return villageHierarchyByDistrict[district.name]?.[taluka] || district.villages || [taluka];
};

export const saveSelectedLocation = (location: ValidatedGujaratLocation) => {
  localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
};

export const getSavedSelectedLocation = (): ValidatedGujaratLocation | null => {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ValidatedGujaratLocation) : null;
  } catch {
    return null;
  }
};

export const buildLocationDisplay = (location: Partial<ValidatedGujaratLocation>) =>
  Array.from(new Set([location.village, location.taluka, location.district, location.state || "Gujarat"].filter(Boolean))).join(", ");
