import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const categories = [
  "all",
  "government",
  "market",
  "weather",
  "pest",
  "subsidy",
];

interface NewsCategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const NewsCategoryTabs = ({ activeCategory, onCategoryChange }: NewsCategoryTabsProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onCategoryChange(category)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition-all duration-200 active:scale-95",
            activeCategory === category
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
          )}
        >
          {t(`news.categories.${category}`)}
        </button>
      ))}
    </div>
  );
};

export default NewsCategoryTabs;
