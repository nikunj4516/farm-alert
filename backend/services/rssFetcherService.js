import axios from "axios";
import Parser from "rss-parser";
import { TRUSTED_NEWS_SOURCES } from "../config/newsSources.js";
import { supabaseAdmin } from "../utils/supabaseClient.js";
import { logger } from "../utils/logger.js";
import { cleanText, detectCategory, detectCrops, detectStates, titleHash } from "../utils/textClassifier.js";
import { AiNewsService } from "./aiNewsService.js";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "FarmAlertNewsBot/1.0 (+https://farmalert1.netlify.app)",
  },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetry = async (operation, retries = 2) => {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < retries) await sleep(500 * 2 ** attempt);
    }
  }
  throw lastError;
};

const normalizeUrl = (url) => {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
};

const normalizeItem = (item, source) => {
  const title = cleanText(item.title);
  const sourceUrl = normalizeUrl(item.link || item.guid);
  if (!title || !sourceUrl) return null;

  const content = cleanText(item["content:encoded"] || item.content || item.summary || item.contentSnippet || "");
  const summary = cleanText(item.contentSnippet || item.summary || content);
  const combined = `${title} ${summary} ${content}`;

  return {
    title,
    summary,
    content,
    source_name: source.name,
    source_url: sourceUrl,
    image_url: item.enclosure?.url || item.image?.url || null,
    category: detectCategory(combined, source.category),
    crop_related: detectCrops(combined),
    state_related: detectStates(combined),
    title_hash: titleHash(title),
    published_at: item.isoDate || item.pubDate || new Date().toISOString(),
  };
};

const fetchRssSource = async (source) => {
  const feed = await withRetry(() => parser.parseURL(source.url));
  return (feed.items || []).map((item) => normalizeItem(item, source)).filter(Boolean);
};

const fetchNewsApi = async () => {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) return [];

  const response = await withRetry(() =>
    axios.get("https://newsapi.org/v2/everything", {
      timeout: 15000,
      params: {
        q: "(agriculture OR farming OR crops OR farmers) AND India",
        language: "en",
        sortBy: "publishedAt",
        pageSize: 50,
        apiKey,
      },
    })
  );

  return (response.data?.articles || [])
    .map((article) =>
      normalizeItem(
        {
          title: article.title,
          link: article.url,
          contentSnippet: article.description,
          content: article.content,
          isoDate: article.publishedAt,
          enclosure: { url: article.urlToImage },
        },
        { name: article.source?.name || "NewsAPI", category: "general" }
      )
    )
    .filter(Boolean);
};

const saveArticles = async (articles) => {
  if (!articles.length) return 0;

  const rows = [];
  for (const article of articles) {
    const baseSummary = await AiNewsService.summarize(article, "en");
    rows.push({ ...article, summary: baseSummary.summary });
  }

  let saved = 0;
  for (const row of rows) {
    const { error } = await supabaseAdmin
      .from("agriculture_news")
      .upsert(row, { onConflict: "source_url" });

    if (error?.code === "23505") {
      logger.info("Skipping duplicate agriculture news article.", {
        title: row.title,
        sourceUrl: row.source_url,
      });
      continue;
    }

    if (error) throw error;
    saved += 1;
  }

  return saved;
};

const logFetch = async (log) => {
  await supabaseAdmin.from("news_fetch_logs").insert(log);
};

export class RssFetcherService {
  static async fetchSource(source, limit = Number(process.env.NEWS_MAX_ITEMS_PER_SOURCE || 20)) {
    const startedAt = new Date().toISOString();
    try {
      const articles = source.type === "rss" ? await fetchRssSource(source) : [];
      const limited = articles.slice(0, limit);
      const saved = await saveArticles(limited);
      await logFetch({
        source_name: source.name,
        status: "success",
        fetched_count: articles.length,
        saved_count: saved,
        started_at: startedAt,
        finished_at: new Date().toISOString(),
      });
      return { source: source.name, fetched: articles.length, saved };
    } catch (error) {
      logger.error("News source fetch failed.", { source: source.name, error: error.message });
      await logFetch({
        source_name: source.name,
        status: "failed",
        message: error.message,
        started_at: startedAt,
        finished_at: new Date().toISOString(),
      });
      return { source: source.name, fetched: 0, saved: 0, error: error.message };
    }
  }

  static async fetchAll(sources = TRUSTED_NEWS_SOURCES) {
    const results = [];
    for (const source of sources.filter((item) => item.trusted)) {
      results.push(await this.fetchSource(source));
    }

    const newsApiArticles = await fetchNewsApi();
    if (newsApiArticles.length) {
      const saved = await saveArticles(newsApiArticles);
      results.push({ source: "NewsAPI", fetched: newsApiArticles.length, saved });
    }

    return results;
  }
}
