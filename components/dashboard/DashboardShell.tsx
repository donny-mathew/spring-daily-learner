"use client";
import { useMemo } from "react";
import { NewsItem } from "@/types";
import { curriculum } from "@/data/curriculum";
import { todayYMD } from "@/lib/utils";
import { TodaySection } from "./TodaySection";
import { BacklogSection } from "./BacklogSection";
import { StreakCard } from "./StreakCard";
import { ProgressRing } from "./ProgressRing";
import { useProgress } from "@/hooks/useProgress";

interface DashboardShellProps {
  news: NewsItem[];
}

export function DashboardShell({ news }: DashboardShellProps) {
  const { isNewsRead, isLectureComplete, hydrated, progress } = useProgress();
  const today = todayYMD();

  const todayNews = useMemo(
    () => news.filter((item) => item.publishedAt.startsWith(today)),
    [news, today]
  );

  const backlogNews = useMemo(
    () => news.filter((item) => !item.publishedAt.startsWith(today)),
    [news, today]
  );

  const nextLecture = useMemo(
    () => curriculum.find((t) => !isLectureComplete(t.slug)) ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progress.lectureProgress]
  );

  // Progress: today's items read / total today's items
  const todayReadCount = todayNews.filter((item) => isNewsRead(item.id)).length;
  const todayProgress =
    todayNews.length > 0 ? (todayReadCount / todayNews.length) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      {/* Main content */}
      <div className="flex flex-col gap-8">
        <TodaySection todayNews={todayNews} nextLecture={nextLecture} />
        <BacklogSection backlogItems={backlogNews} />
      </div>

      {/* Sidebar widgets */}
      <div className="flex flex-col gap-4">
        {/* Today's Progress */}
        {hydrated && todayNews.length > 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
              Today&apos;s Progress
            </h3>
            <div className="flex items-center gap-4">
              <ProgressRing value={todayProgress} />
              <div>
                <div className="text-sm font-semibold text-[var(--foreground)]">
                  {todayReadCount}/{todayNews.length} read
                </div>
                <div className="text-xs text-[var(--muted)]">articles today</div>
              </div>
            </div>
          </div>
        )}

        <StreakCard />

        {/* Curriculum progress */}
        {hydrated && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
              Curriculum Progress
            </h3>
            <div className="flex items-center gap-4">
              <ProgressRing
                value={
                  (curriculum.filter((t) => isLectureComplete(t.slug)).length /
                    curriculum.length) *
                  100
                }
                size={56}
              />
              <div>
                <div className="text-sm font-semibold text-[var(--foreground)]">
                  {curriculum.filter((t) => isLectureComplete(t.slug)).length}/{curriculum.length}
                </div>
                <div className="text-xs text-[var(--muted)]">topics complete</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
