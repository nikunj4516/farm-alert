import { AgricultureNews } from "@/services/newsService";
import NewsFeed from "./NewsFeed";

interface PersonalizedNewsProps {
  articles?: AgricultureNews[];
  isLoading?: boolean;
}

const PersonalizedNews = ({ articles, isLoading }: PersonalizedNewsProps) => (
  <section className="space-y-3">
    <div>
      <h2 className="text-lg font-semibold text-foreground">Personalized Agriculture News</h2>
      <p className="text-xs font-medium text-muted-foreground">
        Matched by your crop, state, and district when available.
      </p>
    </div>
    <NewsFeed
      articles={articles}
      isLoading={isLoading}
      emptyTitle="No personalized verified news yet"
    />
  </section>
);

export default PersonalizedNews;
