"use client";
import { useProgress } from "@/hooks/useProgress";
import { useStreak } from "@/hooks/useStreak";
import { cn } from "@/lib/utils";

export function StreakCard() {
  const { progress, hydrated } = useProgress();
  const { streak, heatmap } = useStreak(progress);

  if (!hydrated) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 animate-pulse">
        <div className="h-16" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Learning Streak</h3>
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🔥</span>
          <span className="text-xl font-bold text-amber-400">{streak}</span>
          <span className="text-xs text-[var(--muted)]">day{streak !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* 30-day heatmap */}
      <div className="flex gap-0.5 flex-wrap">
        {heatmap.map((day) => (
          <div
            key={day.date}
            title={day.date}
            className={cn(
              "h-3 w-3 rounded-sm",
              day.active ? "bg-[#6db33f]" : "bg-[var(--hover)]"
            )}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between">
        <span className="text-[10px] text-[var(--muted)]">30 days ago</span>
        <span className="text-[10px] text-[var(--muted)]">Today</span>
      </div>
    </div>
  );
}
