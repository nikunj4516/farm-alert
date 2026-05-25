import { ExternalLink } from "lucide-react";
import { AgricultureNews } from "@/services/newsService";

interface NewsCardProps {
  article: AgricultureNews;
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));

const NewsCard = ({ article }: NewsCardProps) => (
  <article className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex items-start gap-3">
      {article.image_url ? (
        <img
          src={article.image_url}
          alt=""
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
          📰
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
            {article.source_name}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold capitalize text-muted-foreground">
            {article.category}
          </span>
        </div>
        <h3 className="text-base font-bold leading-snug text-foreground">{article.title}</h3>
        {article.summary && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{article.summary}</p>
        )}
      </div>
    </div>

    <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
      <span className="text-xs font-medium text-muted-foreground">{formatDate(article.published_at)}</span>
      <a
        href={article.source_url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent"
      >
        Read source
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  </article>
);

export default NewsCard;
