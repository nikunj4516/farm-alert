import { supabaseAdmin } from "../utils/supabaseClient.js";

const normalize = (value) => String(value || "").trim();
const arrayFilterValue = (value) =>
  value.includes(" ") ? `{"${value.replace(/"/g, '\\"')}"}` : `{${value}}`;

export class NewsRecommendationService {
  static async getLatest({ page = 1, limit = 10, category } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("agriculture_news")
      .select("*", { count: "exact" })
      .order("published_at", { ascending: false })
      .range(from, to);

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], count: count || 0, page, limit };
  }

  static async getPersonalized({ userId, page = 1, limit = 10, category } = {}) {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("state,district,crop_type")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) throw profileError;

    const crop = normalize(profile?.crop_type);
    const state = normalize(profile?.state);
    const district = normalize(profile?.district);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("agriculture_news")
      .select("*", { count: "exact" })
      .order("published_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (crop || state || district) {
      const filters = [];
      if (crop) filters.push(`crop_related.cs.${arrayFilterValue(crop)}`);
      if (state) filters.push(`state_related.cs.${arrayFilterValue(state)}`);
      if (district) filters.push(`content.ilike.%${district}%`, `summary.ilike.%${district}%`);
      query = query.or(filters.join(","));
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return { data: data || [], count: count || 0, page, limit, profile };
  }
}
