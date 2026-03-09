"use client";
import { useState } from "react";
import Link from "next/link";
import { curriculum } from "@/data/curriculum";
import { CurriculumTopic } from "@/types";
import { TIER_LABELS } from "@/data/categories";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";

const DIFFICULTY_BADGE: Record<string, string> = {
  beginner: "bg-blue-100 text-blue-700",
  intermediate: "bg-green-100 text-green-700",
  advanced: "bg-purple-100 text-purple-700",
};

type FilterValue = "all" | 1 | 2 | 3 | 4;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All Patterns" },
  { value: 1, label: "Tier 1 · Fundamentals" },
  { value: 2, label: "Tier 2 · Microservices" },
  { value: 3, label: "Tier 3 · Advanced" },
  { value: 4, label: "Tier 4 · Spring AI" },
];

function TopicCard({ topic, isComplete, onToggle }: {
  topic: CurriculumTopic;
  isComplete: boolean;
  onToggle: () => void;
}) {
  const badge = DIFFICULTY_BADGE[topic.difficulty];
  const firstQ = topic.interviewQuestions[0] ?? "";
  const firstSection = topic.sections[0]?.content ?? topic.overview;

  return (
    <div className={cn(
      "flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden",
      isComplete && "opacity-70"
    )}>
      <div className="flex flex-1 flex-col p-5">
        {/* Header row */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-gray-900 leading-snug">{topic.title}</h3>
          <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize", badge)}>
            {topic.difficulty}
          </span>
        </div>

        <p className="mb-4 text-xs text-gray-500 leading-relaxed line-clamp-2">{topic.overview}</p>

        {firstQ && (
          <div className="mb-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Use Case</span>
            <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">{firstQ}</p>
          </div>
        )}

        {firstSection && firstSection !== topic.overview && (
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Real-world</span>
            <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">{firstSection}</p>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-3">
          <Link
            href={`/system-design/${topic.slug}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-900 py-2 text-xs font-semibold text-white hover:bg-gray-700 transition-colors"
          >
            Learn More
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <button
            onClick={onToggle}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-medium transition-colors",
              isComplete
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
            )}
          >
            {isComplete ? "✓ Completed" : "Mark Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CurriculumGrid() {
  const [filter, setFilter] = useState<FilterValue>("all");
  const { isLectureComplete, markLectureComplete, markLectureIncomplete, hydrated } = useProgress();

  const filtered = filter === "all" ? curriculum : curriculum.filter((t) => t.tier === filter);

  const counts: Record<string, number> = { all: curriculum.length };
  for (const t of curriculum) {
    counts[String(t.tier)] = (counts[String(t.tier)] ?? 0) + 1;
  }

  return (
    <div>
      {/* Segmented filter */}
      <div className="mb-8 flex overflow-x-auto rounded-lg bg-gray-100 p-1 gap-1">
        {FILTERS.map((f) => (
          <button
            key={String(f.value)}
            onClick={() => setFilter(f.value)}
            className={cn(
              "shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              filter === f.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {f.label}
            {f.value !== "all" && (
              <span className="ml-1.5 text-xs text-gray-400">
                ({counts[String(f.value)] ?? 0})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Group by tier when showing all */}
      {filter === "all" ? (
        <div className="flex flex-col gap-10">
          {([1, 2, 3, 4] as const).map((tier) => (
            <section key={tier}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                Tier {tier} — {TIER_LABELS[tier]}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {curriculum.filter((t) => t.tier === tier).map((topic) => (
                  <TopicCard
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
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((topic) => (
            <TopicCard
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
      )}
    </div>
  );
}
