"use client";
import { NewsItem } from "@/types";
import { CurriculumTopic } from "@/types";
import { NewsCard } from "@/components/news/NewsCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/shared/Badge";
import { DIFFICULTY_CONFIG, TIER_LABELS } from "@/data/categories";
import { useProgress } from "@/hooks/useProgress";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TodaySectionProps {
  todayNews: NewsItem[];
  nextLecture: CurriculumTopic | null;
}

export function TodaySection({ todayNews, nextLecture }: TodaySectionProps) {
  const { isNewsRead, markNewsRead, markNewsUnread, isLectureComplete, markLectureComplete, markLectureIncomplete, hydrated } = useProgress();

  return (
    <div className="flex flex-col gap-6">
      {/* Today's Lecture */}
      {nextLecture && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Today&apos;s Lecture
          </h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className="bg-[var(--hover)] text-[var(--muted)]">
                Tier {nextLecture.tier} · {TIER_LABELS[nextLecture.tier]}
              </Badge>
              <Badge
                className={cn(
                  DIFFICULTY_CONFIG[nextLecture.difficulty].bg,
                  DIFFICULTY_CONFIG[nextLecture.difficulty].text
                )}
              >
                {DIFFICULTY_CONFIG[nextLecture.difficulty].label}
              </Badge>
              <span className="text-xs text-[var(--muted)]">~{nextLecture.estimatedMinutes} min</span>
            </div>

            <div className="mb-1 text-xs font-medium text-[var(--muted)]">
              #{nextLecture.id} of 55
            </div>
            <h3 className="mb-1.5 text-base font-semibold text-[var(--foreground)]">
              {nextLecture.title}
            </h3>
            <p className="mb-4 text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
              {nextLecture.overview}
            </p>

            <div className="flex items-center gap-3">
              <Link
                href={`/system-design/${nextLecture.slug}`}
                className="rounded-lg bg-[#6db33f] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#5a9e33] transition-colors"
              >
                Study Now
              </Link>
              {hydrated && (
                <button
                  onClick={() =>
                    isLectureComplete(nextLecture.slug)
                      ? markLectureIncomplete(nextLecture.slug)
                      : markLectureComplete(nextLecture.slug)
                  }
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    isLectureComplete(nextLecture.slug)
                      ? "bg-green-500/20 text-green-400"
                      : "bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  {isLectureComplete(nextLecture.slug) ? "✓ Completed" : "Mark Complete"}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Today's News */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Today&apos;s News
        </h2>
        {todayNews.length === 0 ? (
          <EmptyState
            icon="📰"
            title="No new articles today"
            description="Check back later — the feed refreshes hourly."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {todayNews.map((item) => (
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
      </section>
    </div>
  );
}
