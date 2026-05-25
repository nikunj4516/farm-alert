import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "All" },
  { id: "government", label: "Govt" },
  { id: "market", label: "Market" },
  { id: "weather", label: "Weather" },
  { id: "pest", label: "Pest" },
  { id: "subsidy", label: "Schemes" },
];

interface NewsCategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const NewsCategoryTabs = ({ activeCategory, onCategoryChange }: NewsCategoryTabsProps) => (
  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
    {categories.map((category) => (
      <button
        key={category.id}
        type="button"
        onClick={() => onCategoryChange(category.id)}
        className={cn(
          "shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors",
          activeCategory === category.id
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
        )}
      >
        {category.label}
      </button>
    ))}
  </div>
);

export default NewsCategoryTabs;
