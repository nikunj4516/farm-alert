import { AgricultureNews } from "@/services/newsService";
import NewsCard from "./NewsCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface TrendingNewsProps {
  articles?: AgricultureNews[];
}

const TrendingNews = ({ articles }: TrendingNewsProps) => {
  const { t } = useLanguage();

  if (!articles?.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{t("home.trendingNews")}</h2>
      <div className="space-y-3">
        {articles.slice(0, 3).map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
};

export default TrendingNews;
