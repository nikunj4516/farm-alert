import { ExternalLink } from "lucide-react";
import { AgricultureNews } from "@/services/newsService";
import { useLanguage } from "@/contexts/LanguageContext";

interface NewsCardProps {
  article: AgricultureNews;
}

const dateLocales = {
  en: "en-IN",
  hi: "hi-IN",
  gu: "gu-IN",
};

const formatDate = (date: string, language: keyof typeof dateLocales) =>
  new Intl.DateTimeFormat(dateLocales[language], {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));

const sourceLabels = {
  "PIB India Agriculture": {
    en: "PIB India Agriculture",
    hi: "पीआईबी कृषि",
    gu: "પીઆઈબી ખેતી",
  },
  "BusinessLine Agri Business": {
    en: "BusinessLine Agri Business",
    hi: "बिज़नेसलाइन कृषि",
    gu: "બિઝનેસલાઇન ખેતી",
  },
  "BusinessLine Commodities": {
    en: "BusinessLine Commodities",
    hi: "बिज़नेसलाइन कमोडिटी",
    gu: "બિઝનેસલાઇન કોમોડિટી",
  },
  "Krishi Jagran": {
    en: "Krishi Jagran",
    hi: "कृषि जागरण",
    gu: "કૃષિ જાગરણ",
  },
  "Government Agriculture Updates": {
    en: "Government Agriculture Updates",
    hi: "सरकारी कृषि अपडेट",
    gu: "સરકારી ખેતી અપડેટ",
  },
  "Farm Schemes India": {
    en: "Farm Schemes India",
    hi: "किसान योजनाएँ",
    gu: "ખેડૂત યોજનાઓ",
  },
  "Agriculture Market India": {
    en: "Agriculture Market India",
    hi: "कृषि बाज़ार",
    gu: "ખેતી બજાર",
  },
  "Agriculture Weather India": {
    en: "Agriculture Weather India",
    hi: "कृषि मौसम",
    gu: "ખેતી હવામાન",
  },
  "Crop Pest Alerts India": {
    en: "Crop Pest Alerts India",
    hi: "फसल कीट चेतावनी",
    gu: "પાક જીવાત ચેતવણી",
  },
  "Plant Disease Updates India": {
    en: "Plant Disease Updates India",
    hi: "फसल रोग अपडेट",
    gu: "પાક રોગ અપડેટ",
  },
  "FarmAlert Advisory": {
    en: "FarmAlert Advisory",
    hi: "फार्मअलर्ट सलाह",
    gu: "ફાર્મઅલર્ટ સલાહ",
  },
  "ગુજરાત સરકારી ખેતી સમાચાર": {
    en: "Gujarat Govt Agriculture",
    hi: "गुजरात सरकारी कृषि",
    gu: "ગુજરાત સરકારી ખેતી સમાચાર",
  },
  "ગુજરાત ખેડૂત યોજનાઓ": {
    en: "Gujarat Farmer Schemes",
    hi: "गुजरात किसान योजनाएँ",
    gu: "ગુજરાત ખેડૂત યોજનાઓ",
  },
  "ગુજરાત ખેતી બજાર": {
    en: "Gujarat Agriculture Market",
    hi: "गुजरात कृषि बाज़ार",
    gu: "ગુજરાત ખેતી બજાર",
  },
  "ગુજરાત ખેતી હવામાન": {
    en: "Gujarat Agriculture Weather",
    hi: "गुजरात कृषि मौसम",
    gu: "ગુજરાત ખેતી હવામાન",
  },
  "ગુજરાત પાક જીવાત સમાચાર": {
    en: "Gujarat Crop Pest News",
    hi: "गुजरात फसल कीट समाचार",
    gu: "ગુજરાત પાક જીવાત સમાચાર",
  },
  "ગુજરાત ખેતી સમાચાર": {
    en: "Gujarat Agriculture News",
    hi: "गुजरात कृषि समाचार",
    gu: "ગુજરાત ખેતી સમાચાર",
  },
  "सरकारी कृषि समाचार": {
    en: "Government Agriculture News",
    hi: "सरकारी कृषि समाचार",
    gu: "સરકારી ખેતી સમાચાર",
  },
  "किसान योजनाएँ": {
    en: "Farmer Schemes",
    hi: "किसान योजनाएँ",
    gu: "ખેડૂત યોજનાઓ",
  },
  "कृषि बाज़ार": {
    en: "Agriculture Market",
    hi: "कृषि बाज़ार",
    gu: "ખેતી બજાર",
  },
  "कृषि मौसम": {
    en: "Agriculture Weather",
    hi: "कृषि मौसम",
    gu: "ખેતી હવામાન",
  },
  "फसल कीट समाचार": {
    en: "Crop Pest News",
    hi: "फसल कीट समाचार",
    gu: "પાક જીવાત સમાચાર",
  },
  "कृषि समाचार": {
    en: "Agriculture News",
    hi: "कृषि समाचार",
    gu: "ખેતી સમાચાર",
  },
};

const normalizeSourceUrl = (url?: string | null) => {
  if (!url || url === "#") return null;

  try {
    const parsed = new URL(url);
    if (parsed.hostname === "news.google.com" && parsed.pathname.startsWith("/rss/articles/")) {
      parsed.pathname = parsed.pathname.replace("/rss/articles/", "/articles/");
      return parsed.toString();
    }
    return parsed.toString();
  } catch {
    return null;
  }
};

const localizedSourceUrl = (url: string | null, language: keyof typeof dateLocales) => {
  if (!url || language === "en") return url;

  const params = new URLSearchParams({
    sl: "auto",
    tl: language,
    u: url,
  });
  return `https://translate.google.com/translate?${params.toString()}`;
};

const fallbackNewsImages: Record<string, string> = {
  government: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=240&q=75",
  subsidy: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=240&q=75",
  market: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=240&q=75",
  weather: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=240&q=75",
  pest: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=240&q=75",
  general: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=240&q=75",
};

const newsImageFor = (article: AgricultureNews) =>
  article.image_url ||
  article.image ||
  fallbackNewsImages[article.category || "general"] ||
  fallbackNewsImages.general;

const NewsCard = ({ article }: NewsCardProps) => {
  const { language, t } = useLanguage();
  const category = t(`news.categories.${article.category || "general"}`);
  const sourceUrl = normalizeSourceUrl(article.source_url);
  const readUrl = localizedSourceUrl(sourceUrl, language);
  const sourceLabel =
    sourceLabels[article.source_name as keyof typeof sourceLabels]?.[language] ||
    article.source_name;
  const imageUrl = newsImageFor(article);

  const handleReadSource = () => {
    if (!readUrl) return;

    const opened = window.open(readUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.href = readUrl;
    }
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <img
          src={imageUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
              {sourceLabel}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              {category}
            </span>
          </div>
          <h3 className="text-base font-bold leading-snug text-foreground">{article.title}</h3>
          {article.summary && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{article.summary}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
        <span className="text-xs font-medium text-muted-foreground">{formatDate(article.published_at, language)}</span>
        {sourceUrl && (
          <button
            type="button"
            onClick={handleReadSource}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent"
          >
            {t("home.readSource")}
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </article>
  );
};

export default NewsCard;
