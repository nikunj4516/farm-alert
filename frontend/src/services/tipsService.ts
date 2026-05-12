import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/database.types";

type FarmingTip = Database["public"]["Tables"]["farming_tips"]["Row"];

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

      let query = supabase
        .from("farming_tips")
        .select("*")
        .eq("is_active", true)
        .eq("language", language);

      if (cropType) {
        // Fetch tips specific to crop OR general tips
        query = query.or(`crop_type.eq.${cropType},crop_type.is.null`);
      }

      if (season) {
        query = query.or(`season.eq.${season},season.is.null`);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching tips:", error);
      return [];
    }
  }
}
