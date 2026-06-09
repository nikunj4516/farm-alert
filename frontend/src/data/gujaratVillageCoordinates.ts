export interface Coordinate {
  latitude: number;
  longitude: number;
}

// Format keys as: "district|taluka|village" in lowercase for quick matching
export const VILLAGE_COORDINATES: Record<string, Coordinate> = {
  // Ahmedabad
  "ahmedabad|daskroi|aslali": { latitude: 22.9341, longitude: 72.6102 },
  "ahmedabad|daskroi|bareja": { latitude: 22.8845, longitude: 72.6289 },
  "ahmedabad|daskroi|bopal": { latitude: 23.0315, longitude: 72.4699 },
  "ahmedabad|daskroi|ghuma": { latitude: 23.0298, longitude: 72.4485 },
  "ahmedabad|daskroi|kathwada": { latitude: 23.0478, longitude: 72.6894 },
  "ahmedabad|dholka|bavaliyari": { latitude: 22.3789, longitude: 72.2345 },
  "ahmedabad|dholka|koth": { latitude: 22.6102, longitude: 72.2984 },
  "ahmedabad|dholka|nesda": { latitude: 22.7123, longitude: 72.3891 },
  "ahmedabad|dholka|saragwala": { latitude: 22.6894, longitude: 72.3123 },
  "ahmedabad|sanand|bol": { latitude: 22.9841, longitude: 72.3123 },
  "ahmedabad|sanand|chekhla": { latitude: 23.0567, longitude: 72.3456 },
  "ahmedabad|sanand|goraghuma": { latitude: 23.0389, longitude: 72.4102 },
  "ahmedabad|sanand|iyava": { latitude: 22.9894, longitude: 72.3512 },
  "ahmedabad|sanand|nidhrad": { latitude: 23.0078, longitude: 72.3789 },

  // Anand
  "anand|anand|karamsad": { latitude: 22.5456, longitude: 72.8984 },
  "anand|anand|mogri": { latitude: 22.5234, longitude: 72.9456 },
  "anand|anand|vallabh vidyanagar": { latitude: 22.5532, longitude: 72.9189 },
  "anand|anand|vasad": { latitude: 22.4538, longitude: 73.0665 },
  "anand|borsad|borsad": { latitude: 22.4079, longitude: 72.8982 },
  "anand|borsad|dahewan": { latitude: 22.3123, longitude: 72.7891 },
  "anand|borsad|kinkhlod": { latitude: 22.3456, longitude: 72.8512 },
  "anand|borsad|ras": { latitude: 22.3789, longitude: 72.8123 },
  "anand|petlad|dharmaj": { latitude: 22.4212, longitude: 72.7984 },
  "anand|petlad|petlad": { latitude: 22.4768, longitude: 72.8006 },
  "anand|petlad|sunav": { latitude: 22.5102, longitude: 72.8345 },
  "anand|petlad|virsol": { latitude: 22.4894, longitude: 72.8712 },

  // Banaskantha
  "banaskantha|palanpur|chandisar": { latitude: 24.2345, longitude: 72.3891 },
  "banaskantha|palanpur|gathaman": { latitude: 24.1567, longitude: 72.4102 },
  "banaskantha|palanpur|jagana": { latitude: 24.1345, longitude: 72.4678 },
  "banaskantha|palanpur|palanpur": { latitude: 24.1722, longitude: 72.4384 },
  "banaskantha|deesa|bhildi": { latitude: 24.1894, longitude: 72.1891 },
  "banaskantha|deesa|deesa": { latitude: 24.2512, longitude: 72.1902 },
  "banaskantha|deesa|juna deesa": { latitude: 24.2812, longitude: 72.1678 },
  "banaskantha|deesa|mudetha": { latitude: 24.3102, longitude: 72.2456 },
  "banaskantha|vadgam|chhapi": { latitude: 24.0345, longitude: 72.3984 },
  "banaskantha|vadgam|jalotra": { latitude: 24.1102, longitude: 72.5891 },
  "banaskantha|vadgam|vadgam": { latitude: 24.0812, longitude: 72.4902 },

  // Bharuch
  "bharuch|bharuch|bharuch": { latitude: 21.7051, longitude: 72.9959 },
  "bharuch|bharuch|dahej": { latitude: 21.7123, longitude: 72.5891 },
  "bharuch|bharuch|shuklatirth": { latitude: 21.7512, longitude: 73.1102 },
  "bharuch|bharuch|zadeshwar": { latitude: 21.7234, longitude: 73.0345 },
  "bharuch|ankleshwar|ankleshwar": { latitude: 21.6262, longitude: 73.0189 },
  "bharuch|ankleshwar|panoli": { latitude: 21.5345, longitude: 72.9678 },
  "bharuch|ankleshwar|piraman": { latitude: 21.6456, longitude: 73.0234 },
  "bharuch|jhagadia|jhagadia": { latitude: 21.7102, longitude: 73.1567 },
  "bharuch|jhagadia|rajpardi": { latitude: 21.6894, longitude: 73.2102 },
  "bharuch|jhagadia|umalla": { latitude: 21.7345, longitude: 73.2891 },

  // Chhota Udepur
  "chhota udepur|bodeli|bodeli": { latitude: 22.2812, longitude: 73.7102 },
  "chhota udepur|bodeli|dhokaliya": { latitude: 22.2567, longitude: 73.6891 },
  "chhota udepur|bodeli|jabugam": { latitude: 22.3102, longitude: 73.7589 },
  "chhota udepur|chhota udepur|chhota udepur": { latitude: 22.3047, longitude: 74.0158 },
  "chhota udepur|chhota udepur|raski": { latitude: 22.2894, longitude: 74.0567 },
  "chhota udepur|chhota udepur|tejgadh": { latitude: 22.3512, longitude: 74.0902 },
  "chhota udepur|jetpur pavi|jetpur pavi": { latitude: 22.2984, longitude: 73.8891 },
  "chhota udepur|jetpur pavi|kawant road": { latitude: 22.2456, longitude: 73.9123 },
  "chhota udepur|jetpur pavi|moti rasli": { latitude: 22.3456, longitude: 73.8567 },

  // Dahod
  "dahod|dahod|dahod": { latitude: 22.8345, longitude: 74.2606 },
  "dahod|dahod|raliyati": { latitude: 22.8567, longitude: 74.2891 },
  "dahod|dahod|usarvan": { latitude: 22.8123, longitude: 74.2345 },
  "dahod|jhalod|jhalod": { latitude: 23.0567, longitude: 74.1512 },
  "dahod|jhalod|limdi": { latitude: 23.0102, longitude: 74.1234 },
  "dahod|jhalod|mirakhedi": { latitude: 23.0894, longitude: 74.1891 },
  "dahod|limkheda|limkheda": { latitude: 22.8345, longitude: 73.9902 },
  "dahod|limkheda|palli": { latitude: 22.8102, longitude: 74.0234 },
  "dahod|limkheda|singvad": { latitude: 22.7891, longitude: 74.0567 },

  // Gandhinagar
  "gandhinagar|gandhinagar|adalaj": { latitude: 23.1678, longitude: 72.5891 },
  "gandhinagar|gandhinagar|kudasan": { latitude: 23.1891, longitude: 72.6345 },
  "gandhinagar|gandhinagar|pethapur": { latitude: 23.2512, longitude: 72.6567 },
  "gandhinagar|gandhinagar|raysan": { latitude: 23.1984, longitude: 72.6512 },
  "gandhinagar|kalol|chhatral": { latitude: 23.2345, longitude: 72.4891 },
  "gandhinagar|kalol|kalol": { latitude: 23.2567, longitude: 72.4902 },
  "gandhinagar|kalol|saij": { latitude: 23.2789, longitude: 72.5123 },
  "gandhinagar|dehgam|dehgam": { latitude: 23.1678, longitude: 72.8123 },
  "gandhinagar|dehgam|rakhiyal": { latitude: 23.2102, longitude: 72.8891 },

  // Kheda
  "kheda|nadiad|nadiad": { latitude: 22.6945, longitude: 72.8602 },
  "kheda|nadiad|piplag": { latitude: 22.6678, longitude: 72.8345 },
  "kheda|nadiad|uttarsanda": { latitude: 22.7123, longitude: 72.8902 },
  "kheda|kapadvanj|antroli": { latitude: 22.9894, longitude: 73.0123 },
  "kheda|kapadvanj|kapadvanj": { latitude: 23.0189, longitude: 73.0789 },
  "kheda|kapadvanj|kathlal": { latitude: 22.9123, longitude: 72.9902 },
  "kheda|matar|matar": { latitude: 22.6102, longitude: 72.6789 },
  "kheda|matar|limbasi": { latitude: 22.4567, longitude: 72.6123 },
  "kheda|matar|traj": { latitude: 22.5891, longitude: 72.6345 },

  // Mehsana
  "mehsana|mehsana|jagudan": { latitude: 23.5102, longitude: 72.3984 },
  "mesnana|mehsana|mehsana": { latitude: 23.5879, longitude: 72.3693 },
  "mehsana|mehsana|panchot": { latitude: 23.6123, longitude: 72.3345 },
  "mehsana|unjha|brahmanwada": { latitude: 23.7512, longitude: 72.3567 },
  "mehsana|unjha|unjha": { latitude: 23.8012, longitude: 72.3902 },
  "mehsana|visnagar|kansa": { latitude: 23.6891, longitude: 72.5123 },
  "mehsana|visnagar|vadnagar": { latitude: 23.7891, longitude: 72.6345 },
  "mehsana|visnagar|visnagar": { latitude: 23.6984, longitude: 72.5345 },

  // Panchmahal
  "panchmahal|halol|baska": { latitude: 22.5076, longitude: 73.5432 },
  "panchmahal|halol|ravaliya": { latitude: 22.5234, longitude: 73.4891 },
  "panchmahal|halol|vavdi": { latitude: 22.4867, longitude: 73.4562 },
  "panchmahal|jambughoda|bhanpura": { latitude: 22.3821, longitude: 73.7123 },
  "panchmahal|jambughoda|narukot": { latitude: 22.3514, longitude: 73.7589 },
  "panchmahal|jambughoda|rampura": { latitude: 22.3945, longitude: 73.7654 },
  "panchmahal|kalol|alindra": { latitude: 22.6567, longitude: 73.4102 },
  "panchmahal|kalol|arad": { latitude: 22.5891, longitude: 73.5123 },
  "panchmahal|kalol|delol": { latitude: 22.6234, longitude: 73.4902 },
  "panchmahal|godhra|chikhodra": { latitude: 22.8123, longitude: 73.5891 },
  "panchmahal|godhra|godhra": { latitude: 22.7755, longitude: 73.6149 },
  "panchmahal|godhra|vavdi buzarg": { latitude: 22.7984, longitude: 73.6567 },

  // Rajkot
  "rajkot|rajkot|kotharia": { latitude: 22.2512, longitude: 70.8123 },
  "rajkot|rajkot|mavdi": { latitude: 22.2789, longitude: 70.7891 },
  "rajkot|rajkot|metoda": { latitude: 22.2894, longitude: 70.6894 },
  "rajkot|rajkot|shapar": { latitude: 22.1894, longitude: 70.7902 },
  "rajkot|gondal|bharudi": { latitude: 21.9123, longitude: 70.7567 },
  "rajkot|gondal|gondal": { latitude: 21.9619, longitude: 70.7927 },
  "rajkot|gondal|ribda": { latitude: 22.0812, longitude: 70.7891 },
  "rajkot|jetpur|jetpur": { latitude: 21.7589, longitude: 70.6221 },
  "rajkot|jetpur|navagadh": { latitude: 21.7891, longitude: 70.6456 },
  "rajkot|jetpur|pithadiya": { latitude: 21.7102, longitude: 70.5891 },

  // Surat
  "surat|bardoli|bardoli": { latitude: 21.1220, longitude: 73.1115 },
  "surat|bardoli|kadod": { latitude: 21.2102, longitude: 73.1567 },
  "surat|bardoli|varad": { latitude: 21.1567, longitude: 73.0891 },
  "surat|kamrej|kamrej": { latitude: 21.2678, longitude: 72.9678 },
  "surat|kamrej|kathor": { latitude: 21.2891, longitude: 72.9345 },
  "surat|kamrej|velanja": { latitude: 21.2512, longitude: 72.9102 },
  "surat|olpad|olpad": { latitude: 21.3456, longitude: 72.7567 },
  "surat|olpad|sayan": { latitude: 21.3123, longitude: 72.8567 },
  "surat|olpad|takarma": { latitude: 21.3984, longitude: 72.8123 },

  // Vadodara
  "vadodara|vadodara|bajwa": { latitude: 22.3789, longitude: 73.1567 },
  "vadodara|vadodara|harni": { latitude: 22.3345, longitude: 73.2102 },
  "vadodara|vadodara|sevasi": { latitude: 22.3123, longitude: 73.1102 },
  "vadodara|vadodara|tarsali": { latitude: 22.2567, longitude: 73.2234 },
  "vadodara|dabhoi|dabhoi": { latitude: 22.1836, longitude: 73.4336 },
  "vadodara|dabhoi|kayavarohan": { latitude: 22.0812, longitude: 73.4102 },
  "vadodara|dabhoi|thuvavi": { latitude: 22.2102, longitude: 73.3891 },
  "vadodara|padra|padra": { latitude: 22.2380, longitude: 73.0840 },
  "vadodara|padra|sokhda": { latitude: 22.2789, longitude: 73.0567 },
  "vadodara|padra|vadu": { latitude: 22.1567, longitude: 73.0345 },

  // Valsad
  "valsad|valsad|atul": { latitude: 20.5345, longitude: 72.9567 },
  "valsad|valsad|dharampur": { latitude: 20.6102, longitude: 73.1891 },
  "valsad|valsad|valsad": { latitude: 20.5992, longitude: 72.9342 },
  "valsad|pardi|pardi": { latitude: 20.5102, longitude: 72.9456 },
  "valsad|pardi|udvada": { latitude: 20.4789, longitude: 72.9123 },
  "valsad|pardi|vapi": { latitude: 20.3789, longitude: 72.9102 },
  "valsad|umbergaon|bhilad": { latitude: 20.2789, longitude: 72.8891 },
  "valsad|umbergaon|sanjan": { latitude: 20.2102, longitude: 72.8123 },
  "valsad|umbergaon|umbergaon": { latitude: 20.1567, longitude: 72.7567 }
};

export const getVillageCoordinates = (
  district: string | null | undefined,
  taluka: string | null | undefined,
  village: string | null | undefined
): Coordinate | null => {
  if (!district || !taluka || !village) return null;
  const key = `${district.trim().toLowerCase()}|${taluka.trim().toLowerCase()}|${village.trim().toLowerCase()}`;
  return VILLAGE_COORDINATES[key] || null;
};
