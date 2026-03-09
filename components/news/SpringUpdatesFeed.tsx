"use client";
import { useState } from "react";
import { NewsItem, NewsCategory } from "@/types";
import { useProgress } from "@/hooks/useProgress";
import { formatRelativeDate, cn } from "@/lib/utils";

// ── Type badge config ──────────────────────────────────────────────────────
const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  release: { label: "release", cls: "bg-green-100 text-green-700" },
  "spring-ai": { label: "spring ai", cls: "bg-purple-100 text-purple-700" },
  "spring-boot": { label: "spring boot", cls: "bg-blue-100 text-blue-700" },
  "spring-framework": { label: "spring", cls: "bg-indigo-100 text-indigo-700" },
  java: { label: "java", cls: "bg-amber-100 text-amber-700" },
  general: { label: "article", cls: "bg-gray-100 text-gray-600" },
};

function getBadge(item: NewsItem) {
  if (item.isRelease) return TYPE_BADGE.release;
  return TYPE_BADGE[item.category] ?? TYPE_BADGE.general;
}

// ── Tag extraction ─────────────────────────────────────────────────────────
function getTags(item: NewsItem): string[] {
  const tags: string[] = [];
  const title = item.title.toLowerCase();
  if (item.category !== "general") tags.push(item.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
  if (item.isRelease) tags.push("Release");
  if (title.includes("virtual thread")) tags.push("Virtual Threads");
  if (title.includes("native") || title.includes("graalvm")) tags.push("Native Image");
  if (title.includes("security")) tags.push("Security");
  if (title.includes("oauth") || title.includes("jwt")) tags.push("Auth");
  if (title.includes("kafka")) tags.push("Kafka");
  if (title.includes("ai") || title.includes("llm") || title.includes("rag")) tags.push("AI");
  if (title.includes("reactive") || title.includes("webflux")) tags.push("Reactive");
  if (title.includes("batch")) tags.push("Batch");
  if (title.includes("data")) tags.push("Spring Data");
  return [...new Set(tags)].slice(0, 4);
}

// ── Filter tabs ────────────────────────────────────────────────────────────
type FilterValue = "all" | "releases" | NewsCategory;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All Updates" },
  { value: "releases", label: "Releases" },
  { value: "spring-boot", label: "Spring Boot" },
  { value: "spring-ai", label: "Spring AI" },
  { value: "spring-framework", label: "Spring Framework" },
  { value: "java", label: "Java" },
];

// ── Single article card ────────────────────────────────────────────────────
function ArticleCard({ item, isRead, onToggle }: {
  item: NewsItem;
  isRead: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const badge = getBadge(item);
  const tags = getTags(item);

  return (
    <article className={cn(
      "rounded-xl border border-gray-200 bg-white overflow-hidden transition-opacity",
      isRead && "opacity-60"
    )}>
      <div className="p-5">
        {/* Badges + date row */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", badge.cls)}>
            {badge.label}
          </span>
          {item.version && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-mono text-gray-600">
              {item.version}
            </span>
          )}
          <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatRelativeDate(item.publishedAt)}
          </div>
        </div>

        {/* Title */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-base font-bold text-gray-900 hover:text-blue-600 transition-colors leading-snug mb-2"
        >
          {item.title}
        </a>

        {/* Summary */}
        {item.summary && (
          <p className="mb-3 text-sm text-gray-500 leading-relaxed line-clamp-2">{item.summary}</p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Read Full Article button */}
      <button
        onClick={() => {
          setExpanded(!expanded);
          if (!isRead) onToggle();
        }}
        className="flex w-full items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          {isRead ? (
            <>
              <svg className="h-3.5 w-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Read
            </>
          ) : (
            "Read Full Article"
          )}
        </span>
        <svg
          className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
          >
            Open full article
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </article>
  );
}

// ── Main feed ──────────────────────────────────────────────────────────────
export function SpringUpdatesFeed({ items }: { items: NewsItem[] }) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const { isNewsRead, markNewsRead, markNewsUnread, hydrated } = useProgress();

  const filtered = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "releases") return item.isRelease;
    return item.category === filter;
  });

  const counts: Partial<Record<string, number>> = { all: items.length };
  for (const item of items) {
    counts[item.category] = (counts[item.category] ?? 0) + 1;
    if (item.isRelease) counts.releases = (counts.releases ?? 0) + 1;
  }

  return (
    <div>
      {/* Segmented filter */}
      <div className="mb-8 flex overflow-x-auto rounded-lg bg-gray-100 p-1 gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              filter === f.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {f.label}
            {counts[f.value] !== undefined && (
              <span className="ml-1.5 text-xs text-gray-400">({counts[f.value]})</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400">No articles in this category.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((item) => (
            <ArticleCard
              key={item.id}
              item={item}
              isRead={hydrated ? isNewsRead(item.id) : false}
              onToggle={() =>
                isNewsRead(item.id) ? markNewsUnread(item.id) : markNewsRead(item.id)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
