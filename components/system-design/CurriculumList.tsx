"use client";
import { curriculum, getTierTopics } from "@/data/curriculum";
import { TIER_LABELS } from "@/data/categories";
import { LectureCard } from "./LectureCard";
import { useProgress } from "@/hooks/useProgress";
import { ProgressRing } from "@/components/dashboard/ProgressRing";

export function CurriculumList() {
  const { isLectureComplete, markLectureComplete, markLectureIncomplete, hydrated } = useProgress();

  const tiers = [1, 2, 3, 4] as const;

  const totalComplete = hydrated
    ? curriculum.filter((t) => isLectureComplete(t.slug)).length
    : 0;

  return (
    <div>
      {/* Overall progress */}
      {hydrated && (
        <div className="mb-8 flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
          <ProgressRing value={(totalComplete / curriculum.length) * 100} size={64} />
          <div>
            <div className="text-lg font-bold text-[var(--foreground)]">
              {totalComplete}/{curriculum.length}
            </div>
            <div className="text-sm text-[var(--muted)]">topics complete</div>
          </div>
        </div>
      )}

      {tiers.map((tier) => {
        const topics = getTierTopics(tier);
        const complete = hydrated ? topics.filter((t) => isLectureComplete(t.slug)).length : 0;

        return (
          <section key={tier} className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Tier {tier} — {TIER_LABELS[tier]}
              </h2>
              {hydrated && (
                <span className="text-xs text-[var(--muted)]">
                  {complete}/{topics.length}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {topics.map((topic) => (
                <LectureCard
                  key={topic.slug}
                  topic={topic}
                  isComplete={hydrated ? isLectureComplete(topic.slug) : false}
                  onToggle={() =>
                    isLectureComplete(topic.slug)
                      ? markLectureIncomplete(topic.slug)
                      : markLectureComplete(topic.slug)
                  }
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
