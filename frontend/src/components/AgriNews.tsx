import { useState } from "react";
import { AgricultureNews } from "@/services/newsService";
import { useAgricultureNews } from "@/hooks/useAgricultureNews";
import NewsCategoryTabs from "@/components/news/NewsCategoryTabs";
import NewsFeed from "@/components/news/NewsFeed";
import PersonalizedNews from "@/components/news/PersonalizedNews";
import TrendingNews from "@/components/news/TrendingNews";

interface AgriNewsProps {
  newsData?: AgricultureNews[];
  isLoading?: boolean;
}

const AgriNews = ({ newsData, isLoading }: AgriNewsProps) => {
  const [category, setCategory] = useState("all");
  const { data: latestNews, isLoading: isLatestLoading } = useAgricultureNews({
    category,
    limit: 8,
  });

  return (
    <div className="space-y-5">
      <NewsCategoryTabs activeCategory={category} onCategoryChange={setCategory} />
      <PersonalizedNews articles={newsData} isLoading={isLoading} />
      <TrendingNews articles={latestNews} />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Latest Verified News</h2>
        <NewsFeed articles={latestNews} isLoading={isLatestLoading} />
      </section>
    </div>
  );
};

export default AgriNews;
