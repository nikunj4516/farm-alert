import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/database.types";

type AgriNews = Database["public"]["Tables"]["agri_news"]["Row"];

export class NewsService {
  /**
   * Fetches the latest agriculture news from Supabase
   * @param language 'en', 'hi', or 'gu'
   * @param limit maximum number of news items to fetch
   */
  static async getLatestNews(language: string = "gu", limit: number = 10): Promise<AgriNews[]> {
    try {
      const { data, error } = await supabase
        .from("agri_news")
        .select("*")
        .eq("is_active", true)
        .eq("language", language)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching news:", error);
      return [];
    }
  }

  /**
   * Syncs external RSS or News API to Supabase.
   * Typically this would be run in a Supabase Edge Function or cron job.
   * Provided here as part of scalable architecture design.
   */
  static async syncExternalNews(apiKey: string, language: string): Promise<void> {
    if (!apiKey) return;
    
    try {
      // Example NewsAPI integration
      const res = await fetch(`https://newsapi.org/v2/everything?q=agriculture+farming+india&language=${language}&apiKey=${apiKey}`);
      if (res.ok) {
        const data = await res.json();
        const articles = data.articles.slice(0, 5); // Limit batch processing
        
        for (const article of articles) {
          // Upsert to avoid duplicates by URL
          await supabase.from("agri_news").upsert({
            title: article.title,
            description: article.description,
            image_url: article.urlToImage,
            source: article.source.name,
            url: article.url,
            language: language,
            category: "general",
            published_at: article.publishedAt,
            is_active: true
          }, { onConflict: "url" });
        }
      }
    } catch (error) {
      console.error("Error syncing external news:", error);
    }
  }
}
