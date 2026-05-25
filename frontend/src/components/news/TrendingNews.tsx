import { AgricultureNews } from "@/services/newsService";
import NewsCard from "./NewsCard";

interface TrendingNewsProps {
  articles?: AgricultureNews[];
}

const TrendingNews = ({ articles }: TrendingNewsProps) => {
  if (!articles?.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Trending News</h2>
      <div className="space-y-3">
        {articles.slice(0, 3).map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
};

export default TrendingNews;
