import { useEffect, useState } from "react";
import { ExternalLink, Loader2, X } from "lucide-react";
import type { Language } from "@/contexts/LanguageContext";
import { languageNames, useLanguage } from "@/contexts/LanguageContext";
import type { AgricultureNews } from "@/services/newsService";
import { NewsTranslationService, type TranslatedArticle } from "@/services/newsTranslationService";

interface ArticleReaderProps {
  article: AgricultureNews | null;
  onClose: () => void;
}

const languageOptions: Language[] = ["gu", "hi", "en"];

const ArticleReader = ({ article, onClose }: ArticleReaderProps) => {
  const { language, setLanguage, t } = useLanguage();
  const [readerLanguage, setReaderLanguage] = useState<Language>(language);
  const [readerArticle, setReaderArticle] = useState<TranslatedArticle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setReaderLanguage(language);
  }, [language, article?.id]);

  useEffect(() => {
    if (!article) return;

    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    NewsTranslationService.getTranslatedArticle(article, readerLanguage)
      .then((translated) => {
        if (!isMounted) return;
        setReaderArticle(translated);
      })
      .catch((error) => {
        console.warn("Article reader failed:", error);
        if (!isMounted) return;
        setHasError(true);
        setReaderArticle({
          articleId: article.id,
          language: readerLanguage,
          title: article.translatedTitle || article.title,
          summary: article.translatedDescription || article.summary || "",
          content: article.translatedDescription || article.summary || article.content || t("news.reader.translationUnavailable"),
          imageUrl: article.image_url || article.image,
          sourceUrl: article.source_url,
          sourceName: article.source_name,
          extracted: false,
          translationAvailable: false,
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [article, readerLanguage, t]);

  if (!article) return null;

  const content = readerArticle?.content || "";
  const paragraphs = content.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="fixed inset-0 z-[80] bg-black/45 px-3 py-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="mx-auto flex h-full max-w-[620px] flex-col overflow-hidden rounded-2xl bg-card shadow-elevated">
        <div className="flex items-center justify-between gap-3 border-b border-border p-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-primary">{t("news.reader.title")}</p>
            <p className="text-[11px] font-semibold text-muted-foreground">{readerArticle?.sourceName || article.source_name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-muted p-2 text-muted-foreground active:scale-95"
            aria-label={t("news.reader.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto border-b border-border px-3 py-2">
          {languageOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setReaderLanguage(option);
                setLanguage(option);
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black ${
                readerLanguage === option ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {languageNames[option]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("news.reader.loading")}
              </div>
              <div className="h-44 rounded-2xl bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-4/5 rounded bg-muted animate-pulse" />
                <div className="h-4 w-full rounded bg-muted animate-pulse" />
                <div className="h-4 w-11/12 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ) : (
            <article>
              {readerArticle?.imageUrl && (
                <img
                  src={readerArticle.imageUrl}
                  alt=""
                  className="mb-4 h-48 w-full rounded-2xl object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black text-primary">
                  {readerArticle?.extracted ? t("news.reader.fullArticle") : t("news.reader.summaryFallback")}
                </span>
                {hasError && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-black text-amber-700">
                    {t("news.reader.translationUnavailable")}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black leading-tight text-foreground">{readerArticle?.title || article.title}</h2>
              {readerArticle?.summary && (
                <p className="mt-3 rounded-xl bg-muted/70 p-3 text-sm font-semibold leading-relaxed text-muted-foreground">
                  {readerArticle.summary}
                </p>
              )}
              <div className="mt-4 space-y-4 text-base font-medium leading-8 text-foreground">
                {(paragraphs.length ? paragraphs : [readerArticle?.summary || t("news.reader.translationUnavailable")]).map((paragraph, index) => (
                  <p key={`${paragraph.slice(0, 20)}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </article>
          )}
        </div>

        <div className="border-t border-border p-3">
          {readerArticle?.sourceUrl ? (
            <a
              href={readerArticle.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground active:scale-95"
            >
              {t("news.reader.openOriginal")}
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <p className="text-center text-xs font-semibold text-muted-foreground">{t("news.reader.noSource")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleReader;

