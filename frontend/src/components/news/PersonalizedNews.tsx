import { AgricultureNews } from "@/services/newsService";
import NewsFeed from "./NewsFeed";
import { useLanguage } from "@/contexts/LanguageContext";

interface PersonalizedNewsProps {
  articles?: AgricultureNews[];
  isLoading?: boolean;
}

const PersonalizedNews = ({ articles, isLoading }: PersonalizedNewsProps) => {
  const { t } = useLanguage();

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t("home.newsForYou")}</h2>
        <p className="text-xs font-medium text-muted-foreground">{t("home.newsForYouSubtitle")}</p>
      </div>
      <NewsFeed articles={articles} isLoading={isLoading} emptyTitle={t("home.noPersonalNewsTitle")} />
    </section>
  );
};

export default PersonalizedNews;
