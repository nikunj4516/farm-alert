import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/database.types";

type FarmingTip = Database["public"]["Tables"]["farming_tips"]["Row"];

const normalizeCropType = (cropType?: string) => {
  const normalized = cropType?.trim();
  if (!normalized) return undefined;

  const cropAliases: Record<string, string> = {
    wheat: "Wheat",
    rice: "Rice",
    paddy: "Rice",
    cotton: "Cotton",
    groundnut: "Groundnut",
    peanut: "Groundnut",
    sugarcane: "Sugarcane",
    vegetables: "Vegetables",
    vegetable: "Vegetables",
    ઘઉં: "Wheat",
    ડાંગર: "Rice",
    કપાસ: "Cotton",
    મગફળી: "Groundnut",
    શેરડી: "Sugarcane",
    શાકભાજી: "Vegetables",
    गेहूँ: "Wheat",
    गेहूं: "Wheat",
    धान: "Rice",
    कपास: "Cotton",
    मूंगफली: "Groundnut",
    गन्ना: "Sugarcane",
    सब्ज़ी: "Vegetables",
    सब्जी: "Vegetables",
  };

  return cropAliases[normalized.toLowerCase()] || normalized;
};

export class TipsService {
  /**
   * Fetches personalized farming tips
   */
  static async getTips(options: { 
    cropType?: string; 
    language?: string; 
    season?: string;
    limit?: number;
  }): Promise<FarmingTip[]> {
    try {
      const { cropType, language = "gu", season, limit = 5 } = options;
      const normalizedCrop = normalizeCropType(cropType);

      let query = supabase
        .from("farming_tips")
        .select("*")
        .eq("is_active", true)
        .eq("language", language);

      if (normalizedCrop) {
        // Fetch tips specific to crop OR general tips
        query = query.or(`crop_type.eq.${normalizedCrop},crop_type.is.null`);
      }

      if (season) {
        query = query.or(`season.eq.${season},season.is.null`);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (data?.length || !normalizedCrop) return data || [];

      const { data: fallbackData, error: fallbackError } = await supabase
        .from("farming_tips")
        .select("*")
        .eq("is_active", true)
        .eq("language", language)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (fallbackError) throw fallbackError;
      return fallbackData || [];
    } catch (error) {
      console.error("Error fetching tips:", error);
      return [];
    }
  }
}
