import Link from "next/link";
import { curriculum, getTierTopics } from "@/data/curriculum";
import { TIER_LABELS } from "@/data/categories";

const TIER_COLORS = [
  { bar: "bg-blue-500", badge: "text-blue-600 bg-blue-50", icon: "bg-blue-50 text-blue-600" },
  { bar: "bg-green-500", badge: "text-green-600 bg-green-50", icon: "bg-green-50 text-green-600" },
  { bar: "bg-purple-500", badge: "text-purple-600 bg-purple-50", icon: "bg-purple-50 text-purple-600" },
  { bar: "bg-amber-500", badge: "text-amber-600 bg-amber-50", icon: "bg-amber-50 text-amber-600" },
];

const TIER_SAMPLES: Record<number, string[]> = {
  1: ["URL Shortener", "Rate Limiter", "Consistent Hashing", "CAP Theorem"],
  2: ["Kafka", "SAGA Pattern", "CQRS", "Event Sourcing"],
  3: ["Real-Time Chat", "Payment System", "Observability", "gRPC Design"],
  4: ["Spring AI", "RAG Pipeline", "Vector DB", "Virtual Threads"],
};

const FEATURES = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    title: "Live News Feed",
    desc: "Spring Blog RSS + GitHub releases aggregated hourly. Never miss a Spring Boot or Spring AI update.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: "55 System Design Topics",
    desc: "A complete interview prep curriculum from URL Shorteners to Spring AI and GraalVM Native.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Backlog Persistence",
    desc: "Unread items accumulate until explicitly marked read. Nothing disappears until you've seen it.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Learning Streak",
    desc: "Track your daily habit with a 30-day heatmap and streak counter. Build consistency.",
  },
];

export const revalidate = 3600;

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[#2B35B4] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-3 text-4xl font-extrabold text-white leading-tight">
            Master Spring Boot &amp; System Design
          </h1>
          <p className="mb-8 max-w-lg text-base text-blue-100 leading-relaxed">
            Daily news from the Spring ecosystem plus a complete 55-topic system design
            curriculum — built for developers preparing for senior engineering interviews.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/system-design"
              className="flex items-center gap-2 rounded-lg border border-white px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Explore Curriculum
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/news"
              className="flex items-center gap-2 rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/25 transition-colors"
            >
              Spring Updates
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why section ── */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Why Spring Daily Learner?</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Everything a senior Spring Boot developer needs to stay sharp and ace interviews.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  {f.icon}
                </div>
                <h3 className="mb-1.5 text-sm font-bold text-gray-900">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Curriculum Tiers ── */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Curriculum Tiers</h2>
            <p className="text-sm text-gray-500">
              {curriculum.length} topics organized across 4 progressive tiers
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {([1, 2, 3, 4] as const).map((tier, i) => {
              const topics = getTierTopics(tier);
              const color = TIER_COLORS[i];
              const samples = TIER_SAMPLES[tier];
              return (
                <div key={tier} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <div className={`h-1 w-full ${color.bar}`} />
                  <div className="p-5">
                    <h3 className="mb-1 text-base font-bold text-gray-900">
                      {TIER_LABELS[tier]}
                    </h3>
                    <p className="mb-3 text-xs text-gray-500">{topics.length} topics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {samples.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/system-design"
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
            >
              View All Topics
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Spring Updates CTA ── */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl bg-green-600 px-8 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <h3 className="text-lg font-bold text-white">Spring Framework Updates</h3>
                </div>
                <p className="text-sm text-green-100 max-w-md">
                  Stay informed about the latest Spring Boot releases, new features, tutorials,
                  and best practices from the Spring ecosystem.
                </p>
              </div>
              <Link
                href="/news"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Latest Updates
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Start Learning CTA ── */}
      <section className="bg-white px-6 py-16 text-center">
        <div className="mx-auto max-w-xl">
          <div className="mb-4 flex justify-center">
            <svg className="h-10 w-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Start Learning Today</h2>
          <p className="mb-8 text-sm text-gray-500 leading-relaxed">
            Whether you&apos;re preparing for interviews, deepening your Spring Boot expertise,
            or just staying current — this app keeps your learning habit alive every day.
          </p>
          <Link
            href="/system-design"
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
          >
            Begin Your Journey
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
