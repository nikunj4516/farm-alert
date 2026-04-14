import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

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
      <h2 className="text-farmer-base font-bold text-foreground">{t("news_title")}</h2>
      <div className="space-y-2.5">
        {newsItems.map((item, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.97 }}
            className="w-full text-left bg-card border border-border rounded-2xl p-4 shadow-card touch-manipulation hover:shadow-soft transition-shadow"
          >
            <p className="text-farmer-sm font-semibold text-foreground mb-2 leading-relaxed">{item.title}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-full">{item.source}</span>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default AgriNews;
