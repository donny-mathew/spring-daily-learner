"use client";
import { CurriculumTopic } from "@/types";
import { TIER_LABELS } from "@/data/categories";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import Link from "next/link";

const DIFFICULTY_BADGE: Record<string, string> = {
  beginner: "bg-blue-100 text-blue-700",
  intermediate: "bg-green-100 text-green-700",
  advanced: "bg-purple-100 text-purple-700",
};

interface Props {
  topic: CurriculumTopic;
  prevTopic: CurriculumTopic | null;
  nextTopic: CurriculumTopic | null;
}

export function LectureView({ topic, prevTopic, nextTopic }: Props) {
  const { isLectureComplete, markLectureComplete, markLectureIncomplete, hydrated } = useProgress();
  const complete = hydrated ? isLectureComplete(topic.slug) : false;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs text-gray-400">
        <Link href="/system-design" className="hover:text-gray-600 transition-colors">
          Design Patterns
        </Link>
        <span>/</span>
        <span className="text-gray-700">{topic.title}</span>
      </div>

      {/* Header card */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
            #{topic.id} · Tier {topic.tier} · {TIER_LABELS[topic.tier]}
          </span>
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", DIFFICULTY_BADGE[topic.difficulty])}>
            {topic.difficulty}
          </span>
          <span className="text-xs text-gray-400">~{topic.estimatedMinutes} min</span>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">{topic.title}</h1>
        <p className="mb-5 text-sm text-gray-500 leading-relaxed">{topic.overview}</p>

        {hydrated && (
          <button
            onClick={() => complete ? markLectureIncomplete(topic.slug) : markLectureComplete(topic.slug)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              complete
                ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                : "bg-gray-900 text-white hover:bg-gray-700"
            )}
          >
            {complete && (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {complete ? "Completed" : "Mark as Complete"}
          </button>
        )}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-5">
        {topic.sections.map((section, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-base font-bold text-gray-900">{section.title}</h2>
            {section.content && (
              <p className="mb-3 text-sm text-gray-600 leading-relaxed">{section.content}</p>
            )}
            {section.code && (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                  <span className="text-xs font-medium text-gray-500">{section.language ?? "code"}</span>
                </div>
                <pre className="overflow-x-auto bg-gray-950 p-4 text-xs leading-relaxed text-gray-100">
                  <code>{section.code}</code>
                </pre>
              </div>
            )}
          </div>
        ))}

        {/* Interview Questions */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-base font-bold text-gray-900">Interview Questions</h2>
          <ul className="flex flex-col gap-3">
            {topic.interviewQuestions.map((q, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-600">{q}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Further Reading */}
        {topic.furtherReading.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-base font-bold text-gray-900">Further Reading</h2>
            <ul className="flex flex-col gap-2">
              {topic.furtherReading.map((link, i) => (
                <li key={i}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Prev / Next nav */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        {prevTopic ? (
          <Link href={`/system-design/${prevTopic.slug}`}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 transition-colors">
            <span className="mb-1 text-xs text-gray-400">← Previous</span>
            <span className="text-sm font-semibold text-gray-900">{prevTopic.title}</span>
          </Link>
        ) : <div />}
        {nextTopic && (
          <Link href={`/system-design/${nextTopic.slug}`}
            className="flex flex-col items-end rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 transition-colors">
            <span className="mb-1 text-xs text-gray-400">Next →</span>
            <span className="text-sm font-semibold text-gray-900">{nextTopic.title}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
