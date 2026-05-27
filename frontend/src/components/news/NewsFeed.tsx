import { Loader2 } from "lucide-react";
import { AgricultureNews } from "@/services/newsService";
import NewsCard from "./NewsCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface NewsFeedProps {
  articles?: AgricultureNews[];
  isLoading?: boolean;
  emptyTitle?: string;
  onRetry?: () => void;
  onRead?: (article: AgricultureNews) => void;
}

const NewsSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
    <div className="flex gap-3">
      <div className="h-16 w-16 rounded-xl bg-muted animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-28 rounded bg-muted animate-pulse" />
        <div className="h-5 w-full rounded bg-muted animate-pulse" />
        <div className="h-4 w-4/5 rounded bg-muted animate-pulse" />
      </div>
    </div>
  </div>
);

const NewsFeed = ({ articles, isLoading, emptyTitle, onRetry, onRead }: NewsFeedProps) => {
  const { t } = useLanguage();
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("home.loadingNews")}
        </div>
        <NewsSkeleton />
        <NewsSkeleton />
        <NewsSkeleton />
      </div>
    );
  }

  if (!articles?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-center">
        <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-2xl">
          📰
        </div>
        <p className="text-base font-bold text-foreground">{emptyTitle || t("home.noNewsTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("home.noNewsBody")}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground active:scale-95"
          >
            {t("home.retry")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} onRead={onRead} />
      ))}
    </div>
  );
};

export default NewsFeed;
