import type { AgricultureNews } from "./newsService";
import { cleanArticleText, isBlockedOrCaptchaContent, stripHtmlNoise } from "./articleCleaner";

export interface ExtractedArticleContent {
  title: string;
  content: string;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  extracted: boolean;
}

const normalizeSourceUrl = (url?: string | null) => {
  if (!url || url === "#") return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "news.google.com" && parsed.pathname.startsWith("/rss/articles/")) {
      parsed.pathname = parsed.pathname.replace("/rss/articles/", "/articles/");
    }
    return parsed.toString();
  } catch {
    return null;
  }
};

const proxiedUrls = (url: string) => [`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`];

const jinaReaderUrl = (url: string) => {
  const parsed = new URL(url);
  return `https://r.jina.ai/http://${parsed.hostname}${parsed.pathname}${parsed.search}`;
};

const extractTitle = (html: string, fallback: string) => {
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return cleanArticleText(ogTitle || title || fallback).split("\n")[0] || fallback;
};

const extractImage = (html: string, fallback?: string | null) =>
  html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
  html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ||
  fallback ||
  null;

const extractReadableContent = (html: string) => {
  const cleanedHtml = stripHtmlNoise(html);
  const articleMatch =
    cleanedHtml.match(/<article[\s\S]*?<\/article>/i)?.[0] ||
    cleanedHtml.match(/<main[\s\S]*?<\/main>/i)?.[0] ||
    cleanedHtml;

  return cleanArticleText(articleMatch);
};

export const extractArticleContent = async (article: AgricultureNews): Promise<ExtractedArticleContent> => {
  const sourceUrl = normalizeSourceUrl(article.source_url);
  const fallbackContent = cleanArticleText(article.content || article.summary || article.description || "");
  const fallback: ExtractedArticleContent = {
    title: article.translatedTitle || article.title,
    content: fallbackContent,
    imageUrl: article.image_url || article.image,
    sourceUrl,
    extracted: false,
  };

  if (!sourceUrl) return fallback;

  const candidateUrls = [jinaReaderUrl(sourceUrl), ...proxiedUrls(sourceUrl)];
  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 9000);
      const response = await fetch(url, { signal: controller.signal });
      window.clearTimeout(timeout);
      if (!response.ok) continue;

      const html = await response.text();
      if (isBlockedOrCaptchaContent(html)) continue;

      const content = extractReadableContent(html);
      if (content.length < 120) continue;

      return {
        title: extractTitle(html, fallback.title),
        content,
        imageUrl: extractImage(html, fallback.imageUrl),
        sourceUrl,
        extracted: true,
      };
    } catch (error) {
      console.warn("Article extraction failed:", error);
    }
  }

  return fallback;
};
