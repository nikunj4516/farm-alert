import { AgricultureNews } from "@/services/newsService";
import { useAgricultureNews } from "@/hooks/useAgricultureNews";
import NewsFeed from "@/components/news/NewsFeed";
import PersonalizedNews from "@/components/news/PersonalizedNews";
import TrendingNews from "@/components/news/TrendingNews";
import { useLanguage } from "@/contexts/LanguageContext";

interface AgriNewsProps {
  newsData?: AgricultureNews[];
  isLoading?: boolean;
}

const AgriNews = ({ newsData, isLoading }: AgriNewsProps) => {
  const { language, t } = useLanguage();
  const { data: latestNews } = useAgricultureNews({
    category: "all",
    language,
    limit: 30,
  });
  const governmentNews = useAgricultureNews({ category: "government", language, limit: 3 });
  const marketNews = useAgricultureNews({ category: "market", language, limit: 3 });
  const weatherNews = useAgricultureNews({ category: "weather", language, limit: 3 });
  const pestNews = useAgricultureNews({ category: "pest", language, limit: 3 });
  const subsidyNews = useAgricultureNews({ category: "subsidy", language, limit: 3 });

  const categorySections = [
    "government",
    "market",
    "weather",
    "pest",
    "subsidy",
  ];
  const sectionQueries = {
    government: governmentNews,
    market: marketNews,
    weather: weatherNews,
    pest: pestNews,
    subsidy: subsidyNews,
  };

  return (
    <div className="space-y-5">
      <PersonalizedNews articles={newsData} isLoading={isLoading} />
      <TrendingNews articles={latestNews} />
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">{t("home.categoryWiseNews")}</h2>
        {categorySections.map((section) => {
          const sectionQuery = sectionQueries[section as keyof typeof sectionQueries];
          const articles = sectionQuery.data;

          return (
            <div key={section} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">{t(`news.sections.${section}`)}</h3>
              </div>
              <NewsFeed
                articles={articles}
                isLoading={sectionQuery.isLoading}
                onRetry={() => void sectionQuery.refetch()}
              />
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default AgriNews;
