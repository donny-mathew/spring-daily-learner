"use client";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useStreak } from "@/hooks/useStreak";
import { useProgress } from "@/hooks/useProgress";

export function TopBar() {
  const { progress, hydrated } = useProgress();
  const { streak } = useStreak(progress);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="flex h-12 items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-4 shrink-0">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-[#6db33f] text-white font-bold text-xs">
          S
        </div>
        <span className="text-sm font-semibold text-[var(--foreground)]">Spring Daily</span>
      </div>

      {/* Date — desktop */}
      <div className="hidden lg:block text-sm text-[var(--muted)]">{today}</div>

      <div className="flex items-center gap-3">
        {/* Streak */}
        {hydrated && (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-semibold text-amber-400">
              {streak} day{streak !== 1 ? "s" : ""}
            </span>
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
