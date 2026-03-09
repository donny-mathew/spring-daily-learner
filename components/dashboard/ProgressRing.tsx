interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ value, size = 64, strokeWidth = 6 }: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  const cx = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx}
          cy={cx}
          r={r}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          stroke="#6db33f"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span className="absolute text-xs font-bold text-[var(--foreground)]">
        {Math.round(value)}%
      </span>
    </div>
  );
}
