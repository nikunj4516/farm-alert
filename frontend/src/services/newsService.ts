import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/database.types";

export type AgricultureNews = Database["public"]["Tables"]["agriculture_news"]["Row"];

export interface NewsQueryOptions {
  category?: string;
  cropType?: string | null;
  state?: string | null;
  district?: string | null;
  limit?: number;
}

const arrayFilterValue = (value: string) =>
  value.includes(" ") ? `{"${value.replace(/"/g, '\\"')}"}` : `{${value}}`;

export class NewsService {
  static async getLatestNews(options: NewsQueryOptions = {}): Promise<AgricultureNews[]> {
    try {
      const { category = "all", limit = 10 } = options;
      let query = supabase
        .from("agriculture_news")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(limit);

      if (category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching news:", error);
      return [];
    }
  }

  static async getPersonalizedNews(options: NewsQueryOptions = {}): Promise<AgricultureNews[]> {
    try {
      const { category = "all", cropType, state, district, limit = 10 } = options;
      let query = supabase
        .from("agriculture_news")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(limit);

      if (category !== "all") {
        query = query.eq("category", category);
      }

      const filters: string[] = [];
      if (cropType) filters.push(`crop_related.cs.${arrayFilterValue(cropType)}`);
      if (state) filters.push(`state_related.cs.${arrayFilterValue(state)}`);
      if (district) {
        filters.push(`summary.ilike.%${district}%`, `content.ilike.%${district}%`);
      }

      if (filters.length) {
        query = query.or(filters.join(","));
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data?.length) return data;
      return this.getLatestNews({ category, limit });
    } catch (error) {
      console.error("Error fetching personalized agriculture news:", error);
      return this.getLatestNews({ category: options.category, limit: options.limit });
    }
  }
}
