import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/database.types";
import type { Language } from "@/contexts/LanguageContext";

type AgricultureNewsRow = Database["public"]["Tables"]["agriculture_news"]["Row"];
export type AgricultureNews = AgricultureNewsRow & {
  translatedTitle?: string | null;
  translatedDescription?: string | null;
  description?: string | null;
  image?: string | null;
  source?: string | null;
  publishedAt?: string | null;
  language?: string | null;
};
type LegacyAgriNews = Database["public"]["Tables"]["agri_news"]["Row"];

export interface NewsQueryOptions {
  category?: string;
  cropType?: string | null;
  state?: string | null;
  district?: string | null;
  language?: Language | string;
  limit?: number;
}

const arrayFilterValue = (value: string) =>
  value.includes(" ") ? `{"${value.replace(/"/g, '\\"')}"}` : `{${value}}`;

const newsLanguageSettings: Record<string, { hl: string; ceid: string }> = {
  en: { hl: "en-IN", ceid: "IN:en" },
  hi: { hl: "hi-IN", ceid: "IN:hi" },
  gu: { hl: "gu-IN", ceid: "IN:gu" },
};

const googleNewsFeed = (query: string, language = "en") => {
  const settings = newsLanguageSettings[language] || newsLanguageSettings.en;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${settings.hl}&gl=IN&ceid=${settings.ceid}`;
};

interface TrustedLiveSource {
  name: string;
  feedUrl: string;
  category: string;
  nativeLanguage?: string;
}

const englishTrustedLiveSources: TrustedLiveSource[] = [
  {
    name: "PIB India Agriculture",
    feedUrl: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
    category: "government",
  },
  {
    name: "BusinessLine Agri Business",
    feedUrl: "https://www.thehindubusinessline.com/economy/agri-business/feeder/default.rss",
    category: "market",
  },
  {
    name: "BusinessLine Commodities",
    feedUrl: "https://www.thehindubusinessline.com/markets/commodities/feeder/default.rss",
    category: "market",
  },
  {
    name: "Krishi Jagran",
    feedUrl: "https://krishijagran.com/feeds",
    category: "general",
  },
  {
    name: "Government Agriculture Updates",
    feedUrl: googleNewsFeed("India agriculture ministry OR PM-KISAN OR MSP OR subsidy when:14d", "en"),
    category: "government",
  },
  {
    name: "Farm Schemes India",
    feedUrl: googleNewsFeed("farmers scheme subsidy crop insurance PM-KISAN India when:14d", "en"),
    category: "subsidy",
  },
  {
    name: "Agriculture Market India",
    feedUrl: googleNewsFeed("India agriculture mandi prices MSP commodity cotton wheat rice when:7d", "en"),
    category: "market",
  },
  {
    name: "Agriculture Weather India",
    feedUrl: googleNewsFeed("IMD agriculture weather rain monsoon farmers Gujarat India when:7d", "en"),
    category: "weather",
  },
  {
    name: "Crop Pest Alerts India",
    feedUrl: googleNewsFeed("crop pest disease India agriculture farmers when:90d", "en"),
    category: "pest",
  },
  {
    name: "Plant Disease Updates India",
    feedUrl: googleNewsFeed("plant disease crop protection whitefly bollworm blight India farmers when:90d", "en"),
    category: "pest",
  },
];

const localizedQueries: Record<string, Record<string, string>> = {
  gu: {
    government: "ગુજરાત ખેતી સરકાર કૃષિ વિભાગ PM કિસાન MSP સહાય when:14d",
    subsidy: "ખેડૂત યોજના સહાય પાક વીમા PM કિસાન ગુજરાત when:14d",
    market: "ગુજરાત ખેતી બજાર ભાવ મંડી કપાસ ઘઉં ડાંગર when:7d",
    weather: "ગુજરાત હવામાન વરસાદ ખેતી ખેડૂતો IMD when:7d",
    pest: "ગુજરાત પાક જીવાત રોગ કપાસ સફેદ માખી ખેતી when:90d",
    general: "ગુજરાત કૃષિ સમાચાર ખેતી ખેડૂતો પાક when:7d",
  },
  hi: {
    government: "भारत कृषि सरकार कृषि मंत्रालय PM किसान MSP सब्सिडी when:14d",
    subsidy: "किसान योजना सब्सिडी फसल बीमा PM किसान भारत when:14d",
    market: "भारत कृषि मंडी भाव MSP कपास गेहूं धान when:7d",
    weather: "भारत कृषि मौसम बारिश मानसून किसान IMD when:7d",
    pest: "भारत फसल कीट रोग सफेद मक्खी कृषि किसान when:90d",
    general: "भारत कृषि समाचार खेती किसान फसल when:7d",
  },
};

const localizedSourceNames: Record<string, Record<string, string>> = {
  gu: {
    government: "ગુજરાત સરકારી ખેતી સમાચાર",
    subsidy: "ગુજરાત ખેડૂત યોજનાઓ",
    market: "ગુજરાત ખેતી બજાર",
    weather: "ગુજરાત ખેતી હવામાન",
    pest: "ગુજરાત પાક જીવાત સમાચાર",
    general: "ગુજરાત ખેતી સમાચાર",
  },
  hi: {
    government: "सरकारी कृषि समाचार",
    subsidy: "किसान योजनाएँ",
    market: "कृषि बाज़ार",
    weather: "कृषि मौसम",
    pest: "फसल कीट समाचार",
    general: "कृषि समाचार",
  },
};

const getTrustedLiveSources = (language?: string): TrustedLiveSource[] => {
  const lang = language === "gu" || language === "hi" ? language : "en";
  if (lang === "en") return englishTrustedLiveSources;

  const localizedSources = Object.entries(localizedQueries[lang]).map(([category, query]) => ({
    name: localizedSourceNames[lang][category],
    feedUrl: googleNewsFeed(query, lang),
    category,
    nativeLanguage: lang,
  }));

  return [...localizedSources, ...englishTrustedLiveSources];
};

const cropKeywords: Record<string, string[]> = {
  Wheat: ["wheat", "गेहूं", "गेहूँ", "ઘઉં"],
  Rice: ["rice", "paddy", "धान", "ડાંગર"],
  Cotton: ["cotton", "कपास", "કપાસ"],
  Groundnut: ["groundnut", "peanut", "मूंगफली", "મગફળી"],
  Sugarcane: ["sugarcane", "cane", "गन्ना", "શેરડી"],
  Vegetables: ["vegetable", "tomato", "onion", "potato", "brinjal", "सब्जी", "શાકભાજી"],
};

const CATEGORY_FALLBACKS: Record<string, string[]> = {
  government: ["subsidy", "market", "general"],
  subsidy: ["government", "market", "general"],
  market: ["government", "general"],
  weather: ["pest", "general"],
  pest: ["weather", "general"],
  general: ["market", "government"],
};

const newsResponseCache = new Map<string, { expiresAt: number; articles: AgricultureNews[] }>();
const NEWS_CACHE_MS = 5 * 60 * 1000;

const cleanText = (value?: string | null) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const translationCache = new Map<string, string>();

const translateText = async (text: string | null | undefined, language?: string) => {
  const clean = cleanText(text);
  if (!clean || !language || language === "en") return clean;

  const target = language === "hi" ? "hi" : language === "gu" ? "gu" : "en";
  if (target === "en") return clean;

  const cacheKey = `${target}:${clean}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      q: clean.slice(0, 480),
      langpair: `en|${target}`,
    });
    const response = await fetch(`https://api.mymemory.translated.net/get?${params}`);
    if (!response.ok) return clean;

    const payload = await response.json();
    const translated = cleanText(payload?.responseData?.translatedText);
    const value = translated || clean;
    translationCache.set(cacheKey, value);
    return value;
  } catch (error) {
    console.warn("News translation failed, using original text:", error);
    return clean;
  }
};

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

const detectCategory = (text: string, fallback = "general") => {
  const normalized = text.toLowerCase();
  if (/(msp|price|mandi|market|export|import|commodity|procurement)/.test(normalized)) return "market";
  if (/(rain|monsoon|weather|flood|drought|heat|cyclone)/.test(normalized)) return "weather";
  if (/(pest|disease|whitefly|borer|blight|rust|fungal)/.test(normalized)) return "pest";
  if (/(scheme|subsidy|insurance|pm-kisan|loan|credit|yojana)/.test(normalized)) return "subsidy";
  if (/(ministry|government|pib|cabinet|policy)/.test(normalized)) return "government";
  return fallback;
};

const detectCrops = (text: string) => {
  const normalized = text.toLowerCase();
  return Object.entries(cropKeywords)
    .filter(([, aliases]) => aliases.some((alias) => normalized.includes(alias.toLowerCase())))
    .map(([crop]) => crop);
};

const dedupeArticles = (articles: AgricultureNews[]) => {
  const seen = new Set<string>();
  return articles.filter((article) => {
    const key = `${article.source_url || ""}|${article.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const cacheKey = (scope: string, options: NewsQueryOptions) =>
  JSON.stringify({
    scope,
    category: options.category || "all",
    cropType: options.cropType || "",
    state: options.state || "",
    district: options.district || "",
    language: options.language || "en",
    limit: options.limit || 10,
  });

const getCachedNews = (key: string) => {
  const cached = newsResponseCache.get(key);
  if (!cached || cached.expiresAt < Date.now()) return null;
  return cached.articles;
};

const setCachedNews = (key: string, articles: AgricultureNews[]) => {
  newsResponseCache.set(key, { expiresAt: Date.now() + NEWS_CACHE_MS, articles });
};

const normalizeArticleResponse = (article: AgricultureNews, language?: string): AgricultureNews => ({
  ...article,
  translatedTitle: article.translatedTitle || article.title,
  translatedDescription: article.translatedDescription || article.summary || article.content,
  description: article.summary || article.content,
  image: article.image_url,
  source: article.source_name,
  publishedAt: article.published_at,
  language: language || "en",
});

const advisoryCopy: Record<string, { title: string; summary: string }> = {
  government: {
    title: "Check latest government agriculture schemes and local notices",
    summary: "Review PM-KISAN, crop insurance, MSP procurement, and district agriculture office updates for your farm.",
  },
  subsidy: {
    title: "Keep subsidy documents ready for scheme updates",
    summary: "Keep Aadhaar, land records, bank details, and crop information ready so you can apply quickly when schemes open.",
  },
  market: {
    title: "Track mandi prices before selling produce",
    summary: "Compare local mandi rates, MSP updates, and nearby market demand before deciding the sale date.",
  },
  weather: {
    title: "Use weather alerts before spraying or irrigation",
    summary: "Avoid pesticide spray before rain, irrigate during cooler hours, and watch strong wind warnings.",
  },
  pest: {
    title: "Scout crops early for pest and disease risk",
    summary: "Check leaf undersides, stem damage, and yellowing patches. Act early if whitefly, borer, blight, or fungal symptoms appear.",
  },
  general: {
    title: "Review crop, weather, and market updates daily",
    summary: "Use verified agriculture updates together with your field observations before taking action.",
  },
};

const buildAdvisoryArticles = (category = "general", limit = 3): AgricultureNews[] => {
  const categories = category === "all" ? ["government", "market", "weather", "pest", "subsidy"] : [category];
  return categories.slice(0, limit).map((item) => {
    const advisory = advisoryCopy[item] || advisoryCopy.general;
    const now = new Date().toISOString();
    return {
      id: `advisory-${item}`,
      title: advisory.title,
      summary: advisory.summary,
      content: advisory.summary,
      source_name: "FarmAlert Advisory",
      source_url: "#",
      image_url: null,
      category: item,
      crop_related: [],
      state_related: [],
      title_hash: hashString(advisory.title),
      published_at: now,
      created_at: now,
      updated_at: now,
    } as AgricultureNews;
  });
};

const fromLegacyNews = (news: LegacyAgriNews): AgricultureNews => ({
  id: news.id,
  title: news.title,
  summary: news.description,
  content: news.description,
  source_name: news.source,
  source_url: news.url || "#",
  image_url: news.image_url,
  category: news.category || "general",
  crop_related: [],
  state_related: [],
  title_hash: null,
  published_at: news.published_at,
  created_at: news.created_at,
  updated_at: news.updated_at,
});

const localizeArticle = async (article: AgricultureNews, language?: string): Promise<AgricultureNews> => {
  if (!language || language === "en") return normalizeArticleResponse(article, "en");
  if (article.language === language) return normalizeArticleResponse(article, language);

  const [title, summary] = await Promise.all([
    translateText(article.title, language),
    translateText(article.summary || article.content, language),
  ]);

  return {
    ...article,
    title,
    summary,
    content: summary || article.content,
    translatedTitle: title || article.title,
    translatedDescription: summary || article.summary || article.content,
    description: summary || article.summary || article.content,
    image: article.image_url,
    source: article.source_name,
    publishedAt: article.published_at,
    language,
  };
};

const localizeArticles = async (articles: AgricultureNews[], language?: string) =>
  Promise.all(articles.map((article) => localizeArticle(article, language)));

export class NewsService {
  private static async getLiveTrustedRssNews(options: NewsQueryOptions = {}, allowFallback = true): Promise<AgricultureNews[]> {
    const { category = "all", limit = 10 } = options;
    const articles: AgricultureNews[] = [];

    for (const source of getTrustedLiveSources(options.language)) {
      if (category !== "all" && source.category !== category) continue;

      try {
        const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.feedUrl)}`;
        const response = await fetch(url);
        if (!response.ok) continue;

        const payload = await response.json();
        const items = Array.isArray(payload.items) ? payload.items : [];

        for (const item of items.slice(0, 12)) {
          const title = cleanText(item.title);
          const summary = cleanText(item.description || item.content);
          const sourceUrl = item.link || source.feedUrl;
          if (!title || !sourceUrl) continue;

          const text = `${title} ${summary}`;
          const detectedCategory = source.category === "general" ? detectCategory(text, source.category) : source.category;
          if (category !== "all" && detectedCategory !== category) continue;

          articles.push({
            id: `live-${hashString(`${source.name}-${sourceUrl}`)}`,
            title,
            summary: summary.slice(0, 240),
            content: summary,
            source_name: source.name,
            source_url: sourceUrl,
            image_url: item.thumbnail || item.enclosure?.link || null,
            category: detectedCategory,
            crop_related: detectCrops(text),
            state_related: [],
            title_hash: hashString(title),
            published_at: item.pubDate || new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            language: source.nativeLanguage || "en",
          });
        }
      } catch (error) {
        console.warn(`Live RSS fallback failed for ${source.name}:`, error);
      }
    }

    const latestArticles = dedupeArticles(articles)
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, limit);

    if (latestArticles.length) {
      return localizeArticles(latestArticles, options.language);
    }

    if (allowFallback && category !== "all") {
      for (const fallbackCategory of CATEGORY_FALLBACKS[category] || ["general"]) {
        const fallback = await this.getLiveTrustedRssNews(
          { ...options, category: fallbackCategory, limit },
          false
        );
        if (fallback.length) {
          return fallback.map((article) => ({ ...article, category }));
        }
      }
    }

    return localizeArticles(buildAdvisoryArticles(category, Math.min(limit, 5)), options.language);
  }

  private static async getLegacyNews(options: NewsQueryOptions = {}): Promise<AgricultureNews[]> {
    const { category = "all", limit = 10 } = options;
    let query = supabase
      .from("agri_news")
      .select("*")
      .eq("is_active", true)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) throw error;
    const legacyNews = (data || []).map(fromLegacyNews);
    if (legacyNews.length) return localizeArticles(legacyNews, options.language);
    return this.getLiveTrustedRssNews(options);
  }

  static async getLatestNews(options: NewsQueryOptions = {}): Promise<AgricultureNews[]> {
    const key = cacheKey("latest", options);
    const cached = getCachedNews(key);
    if (cached) return cached;

    try {
      const { category = "all", limit = 10 } = options;
      if (options.language && options.language !== "en") {
        const languageFirst = await this.getLiveTrustedRssNews(options);
        if (languageFirst.length) {
          setCachedNews(key, languageFirst);
          return languageFirst;
        }
      }

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
      if (data?.length) {
        const localized = await localizeArticles(data, options.language);
        setCachedNews(key, localized);
        return localized;
      }

      const fallback = await this.getLegacyNews(options);
      setCachedNews(key, fallback);
      return fallback;
    } catch (error) {
      console.warn("Falling back to legacy agri_news feed:", error);
      try {
        const fallback = await this.getLegacyNews(options);
        setCachedNews(key, fallback);
        return fallback;
      } catch (fallbackError) {
        console.error("Error fetching news:", fallbackError);
        const live = await this.getLiveTrustedRssNews(options);
        setCachedNews(key, live);
        return live;
      }
    }
  }

  static async getPersonalizedNews(options: NewsQueryOptions = {}): Promise<AgricultureNews[]> {
    const key = cacheKey("personalized", options);
    const cached = getCachedNews(key);
    if (cached) return cached;

    try {
      const { category = "all", cropType, state, district, limit = 10 } = options;
      if (options.language && options.language !== "en") {
        const languageFirst = await this.getLatestNews({ category, limit, language: options.language });
        const personalizedLanguageFirst = this.prioritizeNews(languageFirst, options);
        setCachedNews(key, personalizedLanguageFirst);
        return personalizedLanguageFirst;
      }

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

      if (data?.length) {
        const personalized = await localizeArticles(this.prioritizeNews(data, options), options.language);
        setCachedNews(key, personalized);
        return personalized;
      }
      const latest = await this.getLatestNews({ category, limit, language: options.language });
      const personalized = this.prioritizeNews(latest, options);
      setCachedNews(key, personalized);
      return personalized;
    } catch (error) {
      console.error("Error fetching personalized agriculture news:", error);
      const latest = await this.getLatestNews({ category: options.category, limit: options.limit, language: options.language });
      const personalized = this.prioritizeNews(latest, options);
      setCachedNews(key, personalized);
      return personalized;
    }
  }

  static prioritizeNews(articles: AgricultureNews[], options: NewsQueryOptions = {}) {
    const crop = options.cropType?.toLowerCase();
    const state = options.state?.toLowerCase();
    const district = options.district?.toLowerCase();

    return [...articles].sort((a, b) => {
      const score = (article: AgricultureNews) => {
        const text = `${article.title} ${article.summary || ""} ${article.content || ""}`.toLowerCase();
        let value = 0;
        if (crop && article.crop_related.some((item) => item.toLowerCase() === crop)) value += 8;
        if (state && article.state_related.some((item) => item.toLowerCase() === state)) value += 5;
        if (district && text.includes(district)) value += 4;
        if (["weather", "pest", "subsidy", "market"].includes(article.category)) value += 2;
        value += new Date(article.published_at).getTime() / 1_000_000_000_000;
        return value;
      };

      return score(b) - score(a);
    });
  }
}
