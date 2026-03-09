"use client";
import { useState } from "react";
import { NewsItem, NewsCategory } from "@/types";
import { NewsCard } from "./NewsCard";
import { CategoryFilter } from "./CategoryFilter";
import { NewsCardSkeleton } from "./NewsCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useProgress } from "@/hooks/useProgress";

type FilterValue = NewsCategory | "all";

interface NewsFeedProps {
  items: NewsItem[];
  loading?: boolean;
}

export function NewsFeed({ items, loading }: NewsFeedProps) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const { isNewsRead, markNewsRead, markNewsUnread, hydrated } = useProgress();

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  const counts: Partial<Record<FilterValue, number>> = { all: items.length };
  for (const item of items) {
    counts[item.category] = (counts[item.category] ?? 0) + 1;
  }

  return (
    <div>
      <div className="mb-4">
        <CategoryFilter active={filter} onChange={setFilter} counts={counts} />
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No items"
          description="No news in this category right now. Check back later."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              isRead={hydrated ? isNewsRead(item.id) : false}
              onToggleRead={() =>
                isNewsRead(item.id) ? markNewsUnread(item.id) : markNewsRead(item.id)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
