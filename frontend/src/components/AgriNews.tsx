import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Newspaper, Landmark, Wheat, Coins } from "lucide-react";
import { Database } from "@/types/database.types";

interface AgriNewsProps {
  newsData?: Database["public"]["Tables"]["agri_news"]["Row"][];
}

const AgriNews = ({ newsData }: AgriNewsProps) => {
  const { t } = useLanguage();

  const defaultNewsItems = [
    { icon: <Newspaper className="w-5 h-5 text-primary" />, title: t("news_1_title"), source: t("news_1_source"), time: t("news_1_time") },
    { icon: <Landmark className="w-5 h-5 text-primary" />, title: t("news_2_title"), source: t("news_2_source"), time: t("news_2_time") },
    { icon: <Wheat className="w-5 h-5 text-primary" />, title: t("news_3_title"), source: t("news_3_source"), time: t("news_3_time") },
    { icon: <Coins className="w-5 h-5 text-primary" />, title: t("news_4_title"), source: t("news_4_source"), time: t("news_4_time") },
  ];

  const displayNews = newsData && newsData.length > 0
    ? newsData.map(news => ({
        icon: <Newspaper className="w-5 h-5 text-primary" />,
        title: news.title,
        source: news.source,
        time: new Date(news.published_at).toLocaleDateString()
      }))
    : defaultNewsItems;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{t("news_title")}</h2>
      <div className="space-y-3">
        {displayNews.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full text-left bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="shrink-0 mt-0.5">{item.icon}</div>
              <p className="text-base font-semibold text-foreground leading-relaxed">{item.title}</p>
            </div>
            <div className="flex justify-between items-center ml-8">
              <span className="text-xs text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-full">{item.source}</span>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AgriNews;
