import type { Language } from "@/contexts/LanguageContext";
import villageHierarchy from "@/data/gujaratVillageHierarchy.json";

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
  const center = district?.center || null;

  return {
    village: input.village?.trim() || null,
    taluka,
    district: district?.name || null,
    state: "Gujarat",
    latitude: center?.latitude || null,
    longitude: center?.longitude || null,
    confidence: taluka ? "taluka" : district ? "district" : "fallback",
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
