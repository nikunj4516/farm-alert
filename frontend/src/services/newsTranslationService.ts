import type { Language } from "@/contexts/LanguageContext";
import type { AgricultureNews } from "./newsService";
import { cleanArticleText } from "./articleCleaner";
import { extractArticleContent } from "./articleContentExtractor";

export interface TranslatedArticle {
  articleId: string;
  language: Language;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  extracted: boolean;
  translationAvailable: boolean;
}

const CACHE_PREFIX = "farmalert_translated_news_cache_v2";

const getCacheKey = (articleId: string, language: Language) => `${CACHE_PREFIX}:${language}:${articleId}`;

const translateChunk = async (text: string, language: Language) => {
  const clean = cleanArticleText(text);
  if (!clean || language === "en") return clean;

  try {
    const params = new URLSearchParams({
      client: "gtx",
      sl: "auto",
      tl: language,
      dt: "t",
      q: clean.slice(0, 4500),
    });
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`);
    if (!response.ok) return clean;
    const payload = await response.json();
    const translated = Array.isArray(payload?.[0]) ? payload[0].map((part: unknown[]) => part?.[0] || "").join("") : "";
    return cleanArticleText(translated) || clean;
  } catch (error) {
    console.warn("Full article translation failed:", error);
    return clean;
  }
};

const translateLongText = async (text: string, language: Language) => {
  const clean = cleanArticleText(text);
  if (!clean || language === "en") return clean;

  const paragraphs = clean.split(/\n{2,}/);
  const translated: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if ((current + "\n\n" + paragraph).length > 3200) {
      translated.push(await translateChunk(current, language));
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }

  if (current) translated.push(await translateChunk(current, language));
  return translated.filter(Boolean).join("\n\n") || clean;
};

export class NewsTranslationService {
  static getCached(articleId: string, language: Language) {
    try {
      const raw = localStorage.getItem(getCacheKey(articleId, language));
      if (!raw) return null;
      return JSON.parse(raw) as TranslatedArticle;
    } catch {
      return null;
    }
  }

  static setCached(article: TranslatedArticle) {
    try {
      localStorage.setItem(getCacheKey(article.articleId, article.language), JSON.stringify(article));
    } catch {
      // Local storage can be full or unavailable. The reader still works without cache.
    }
  }

  static async getTranslatedArticle(article: AgricultureNews, language: Language): Promise<TranslatedArticle> {
    const articleId = article.id || article.title_hash || article.source_url || article.title;
    const cached = this.getCached(articleId, language);
    if (cached) return cached;

    const extracted = await extractArticleContent(article);
    const fallbackSummary = article.translatedDescription || article.description || article.summary || article.content || "";
    const baseTitle = extracted.title || article.translatedTitle || article.title;
    const baseSummary = fallbackSummary || extracted.content.slice(0, 260);
    const baseContent = extracted.extracted ? extracted.content : fallbackSummary || extracted.content || baseSummary;

    const [title, summary, content] = await Promise.all([
      translateChunk(baseTitle, language),
      translateChunk(baseSummary, language),
      translateLongText(baseContent, language),
    ]);

    const translatedArticle: TranslatedArticle = {
      articleId,
      language,
      title: title || baseTitle,
      summary: summary || baseSummary || content.slice(0, 260),
      content: content || summary || baseContent,
      imageUrl: extracted.imageUrl || article.image_url || article.image,
      sourceUrl: extracted.sourceUrl || article.source_url,
      sourceName: article.source_name || article.source,
      extracted: extracted.extracted,
      translationAvailable: Boolean(title || summary || content),
    };

    this.setCached(translatedArticle);
    return translatedArticle;
  }
}
