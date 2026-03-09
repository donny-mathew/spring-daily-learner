"use client";
import { NewsItem } from "@/types";
import { NewsCard } from "@/components/news/NewsCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useProgress } from "@/hooks/useProgress";

interface BacklogSectionProps {
  backlogItems: NewsItem[];
}

export function BacklogSection({ backlogItems }: BacklogSectionProps) {
  const { isNewsRead, markNewsRead, markNewsUnread, hydrated } = useProgress();

  const unread = backlogItems.filter((item) => !isNewsRead(item.id));

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Backlog
        </h2>
        {hydrated && unread.length > 0 && (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
            {unread.length} unread
          </span>
        )}
      </div>

      {!hydrated || unread.length === 0 ? (
        <EmptyState
          icon="🎉"
          title="Backlog clear!"
          description="You&apos;re all caught up. Come back tomorrow for fresh content."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {unread.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              isRead={false}
              onToggleRead={() => markNewsRead(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
