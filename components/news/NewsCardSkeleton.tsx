export function NewsCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-2 h-4 w-16 rounded bg-[var(--hover)]" />
          <div className="mb-2 h-5 w-3/4 rounded bg-[var(--hover)]" />
          <div className="h-4 w-full rounded bg-[var(--hover)]" />
          <div className="mt-1 h-4 w-2/3 rounded bg-[var(--hover)]" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-[var(--hover)]" />
        <div className="h-6 w-20 rounded bg-[var(--hover)]" />
      </div>
    </div>
  );
}
