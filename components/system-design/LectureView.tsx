"use client";
import { CurriculumTopic } from "@/types";
import { DIFFICULTY_CONFIG, TIER_LABELS } from "@/data/categories";
import { Badge } from "@/components/shared/Badge";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface LectureViewProps {
  topic: CurriculumTopic;
  prevTopic: CurriculumTopic | null;
  nextTopic: CurriculumTopic | null;
}

export function LectureView({ topic, prevTopic, nextTopic }: LectureViewProps) {
  const { isLectureComplete, markLectureComplete, markLectureIncomplete, hydrated } = useProgress();
  const diff = DIFFICULTY_CONFIG[topic.difficulty];
  const complete = hydrated ? isLectureComplete(topic.slug) : false;

  return (
    <article className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/system-design" className="hover:text-[var(--foreground)] transition-colors">
          System Design
        </Link>
        <span>/</span>
        <span className="text-[var(--foreground)]">{topic.title}</span>
      </div>

      {/* Header */}
      <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge className="bg-[var(--hover)] text-[var(--muted)]">
            #{topic.id} · Tier {topic.tier} · {TIER_LABELS[topic.tier]}
          </Badge>
          <Badge className={cn(diff.bg, diff.text)}>{diff.label}</Badge>
          <span className="text-xs text-[var(--muted)]">~{topic.estimatedMinutes} min</span>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-[var(--foreground)]">{topic.title}</h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">{topic.overview}</p>

        <div className="mt-4 flex items-center gap-3">
          {hydrated && (
            <button
              onClick={() =>
                complete ? markLectureIncomplete(topic.slug) : markLectureComplete(topic.slug)
              }
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                complete
                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  : "bg-[#6db33f] text-white hover:bg-[#5a9e33]"
              )}
            >
              {complete ? (
                <>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Completed
                </>
              ) : (
                "Mark as Complete"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-6">
        {topic.sections.map((section, i) => (
          <section key={i} className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
            <h2 className="mb-3 text-base font-semibold text-[var(--foreground)]">
              {section.title}
            </h2>
            <p className="mb-3 text-sm text-[var(--muted)] leading-relaxed">{section.content}</p>
            {section.code && (
              <div className="relative">
                <div className="flex items-center justify-between rounded-t-lg bg-[var(--code-header)] px-3 py-1.5">
                  <span className="text-xs font-medium text-[var(--muted)]">
                    {section.language ?? "code"}
                  </span>
                </div>
                <pre className="overflow-x-auto rounded-b-lg bg-[var(--code-bg)] p-4 text-xs leading-relaxed">
                  <code className="text-[var(--code-text)]">{section.code}</code>
                </pre>
              </div>
            )}
          </section>
        ))}

        {/* Interview Questions */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
          <h2 className="mb-3 text-base font-semibold text-[var(--foreground)]">
            Interview Questions
          </h2>
          <ul className="flex flex-col gap-2">
            {topic.interviewQuestions.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#6db33f]/20 text-[10px] font-bold text-[#6db33f]">
                  {i + 1}
                </span>
                {q}
              </li>
            ))}
          </ul>
        </section>

        {/* Further Reading */}
        {topic.furtherReading.length > 0 && (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
            <h2 className="mb-3 text-base font-semibold text-[var(--foreground)]">
              Further Reading
            </h2>
            <ul className="flex flex-col gap-2">
              {topic.furtherReading.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#6db33f] hover:underline"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Prev / Next navigation */}
      <div className="mt-8 flex justify-between gap-4">
        {prevTopic ? (
          <Link
            href={`/system-design/${prevTopic.slug}`}
            className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 hover:border-[#6db33f]/50 transition-colors max-w-xs"
          >
            <span className="text-xs text-[var(--muted)]">← Previous</span>
            <span className="mt-0.5 text-sm font-medium text-[var(--foreground)]">
              {prevTopic.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {nextTopic && (
          <Link
            href={`/system-design/${nextTopic.slug}`}
            className="flex flex-col items-end rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 hover:border-[#6db33f]/50 transition-colors max-w-xs"
          >
            <span className="text-xs text-[var(--muted)]">Next →</span>
            <span className="mt-0.5 text-sm font-medium text-[var(--foreground)]">
              {nextTopic.title}
            </span>
          </Link>
        )}
      </div>
    </article>
  );
}
