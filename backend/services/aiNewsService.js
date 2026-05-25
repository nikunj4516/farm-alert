import OpenAI from "openai";
import { cleanText } from "../utils/textClassifier.js";
import { logger } from "../utils/logger.js";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const languageNames = {
  en: "English",
  hi: "Hindi",
  gu: "Gujarati",
};

const extractiveSummary = (article) => {
  const text = cleanText(article.content || article.summary || article.title);
  if (text.length <= 280) return text;
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, 2).join(" ").slice(0, 420);
};

export class AiNewsService {
  static isEnabled() {
    return Boolean(openai && process.env.NEWS_AI_ENABLED === "true");
  }

  static async summarize(article, language = "en") {
    if (!this.isEnabled()) {
      return {
        summary: extractiveSummary(article),
        language: "en",
        aiGenerated: false,
      };
    }

    const targetLanguage = languageNames[language] || "English";
    const sourceText = cleanText(
      [article.title, article.summary, article.content].filter(Boolean).join("\n\n")
    ).slice(0, 5000);

    try {
      const response = await openai.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You summarize verified agriculture news for Indian farmers. Do not invent facts, names, numbers, dates, sources, or headlines. If a detail is missing, omit it.",
          },
          {
            role: "user",
            content: `Summarize this news in ${targetLanguage} in 2 short farmer-friendly sentences. Preserve facts exactly.\n\n${sourceText}`,
          },
        ],
      });

      return {
        summary: cleanText(response.output_text || extractiveSummary(article)),
        language,
        aiGenerated: true,
      };
    } catch (error) {
      logger.warn("AI summarization failed; using extractive summary.", {
        sourceUrl: article.source_url,
        error: error.message,
      });
      return {
        summary: extractiveSummary(article),
        language: "en",
        aiGenerated: false,
      };
    }
  }
}
