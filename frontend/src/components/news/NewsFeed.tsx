import { Loader2 } from "lucide-react";
import { AgricultureNews } from "@/services/newsService";
import NewsCard from "./NewsCard";

interface NewsFeedProps {
  articles?: AgricultureNews[];
  isLoading?: boolean;
  emptyTitle?: string;
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

const NewsFeed = ({ articles, isLoading, emptyTitle = "No verified agriculture news yet" }: NewsFeedProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading verified news
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
        <p className="text-base font-bold text-foreground">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The feed will appear after the news fetcher stores real articles from trusted sources.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default NewsFeed;
