"use client";
import { NewsCategory } from "@/types";
import { CATEGORY_CONFIG } from "@/data/categories";
import { cn } from "@/lib/utils";

type FilterValue = NewsCategory | "all";

interface CategoryFilterProps {
  active: FilterValue;
  onChange: (value: FilterValue) => void;
  counts?: Partial<Record<FilterValue, number>>;
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "spring-boot", label: "Spring Boot" },
  { value: "spring-ai", label: "Spring AI" },
  { value: "spring-framework", label: "Spring Framework" },
  { value: "java", label: "Java" },
];

export function CategoryFilter({ active, onChange, counts }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => {
        const isActive = f.value === active;
        const cat = f.value !== "all" ? CATEGORY_CONFIG[f.value] : null;
        const count = counts?.[f.value];

        return (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? cat
                  ? `${cat.bg} ${cat.text} border border-current/30`
                  : "bg-[var(--foreground)] text-[var(--background)]"
                : "bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {f.label}
            {count !== undefined && (
              <span className="rounded-full bg-current/20 px-1.5 py-0.5 text-[10px] font-bold leading-none">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
