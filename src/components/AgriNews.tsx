import { useLanguage } from "@/contexts/LanguageContext";

const AgriNews = () => {
  const { t } = useLanguage();

  const newsItems = [
    { title: t("news_1_title"), source: t("news_1_source"), time: t("news_1_time") },
    { title: t("news_2_title"), source: t("news_2_source"), time: t("news_2_time") },
    { title: t("news_3_title"), source: t("news_3_source"), time: t("news_3_time") },
    { title: t("news_4_title"), source: t("news_4_source"), time: t("news_4_time") },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-farmer-lg font-bold text-foreground">{t("news_title")}</h2>
      <div className="space-y-3">
        {newsItems.map((item, index) => (
          <button
            key={index}
            className="w-full text-left bg-card border-2 border-border rounded-lg p-4 active:bg-muted transition-colors touch-manipulation"
          >
            <p className="text-farmer-base font-semibold text-foreground mb-2">{item.title}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-medium">{item.source}</span>
              <span className="text-sm text-muted-foreground">{item.time}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AgriNews;
