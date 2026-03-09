"use client";
import Link from "next/link";
import { CurriculumTopic } from "@/types";
import { DIFFICULTY_CONFIG } from "@/data/categories";
import { Badge } from "@/components/shared/Badge";
import { cn } from "@/lib/utils";

interface LectureCardProps {
  topic: CurriculumTopic;
  isComplete: boolean;
  onToggle: () => void;
}

export function LectureCard({ topic, isComplete, onToggle }: LectureCardProps) {
  const diff = DIFFICULTY_CONFIG[topic.difficulty];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 transition-all",
        isComplete && "opacity-70"
      )}
    >
      {/* Number / check */}
      <button
        onClick={onToggle}
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
          isComplete
            ? "border-green-500 bg-green-500 text-white"
            : "border-[var(--border)] text-[var(--muted)] hover:border-[#6db33f] hover:text-[#6db33f]"
        )}
        aria-label={isComplete ? "Mark incomplete" : "Mark complete"}
      >
        {isComplete ? (
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          topic.id
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <Badge className={cn(diff.bg, diff.text)}>{diff.label}</Badge>
          <span className="text-xs text-[var(--muted)]">~{topic.estimatedMinutes} min</span>
        </div>

        <Link
          href={`/system-design/${topic.slug}`}
          className="block text-sm font-semibold text-[var(--foreground)] hover:text-[#6db33f] transition-colors"
        >
          {topic.title}
        </Link>
        <p className="mt-0.5 text-xs text-[var(--muted)] line-clamp-1">{topic.overview}</p>
      </div>
    </div>
  );
}
