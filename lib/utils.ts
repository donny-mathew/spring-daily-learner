import { NewsCategory } from "@/types";

// Stable ID from URL — same article always gets same ID
export function generateId(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit int
  }
  return Math.abs(hash).toString(36);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
}

export function formatRelativeDate(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function toYMD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayYMD(): string {
  return toYMD(new Date());
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Infer category from RSS tags / title
export function inferCategory(
  tags: string[] = [],
  title: string = "",
  summary: string = ""
): NewsCategory {
  const text = [...tags, title, summary].join(" ").toLowerCase();
  if (text.includes("spring-ai") || text.includes("spring ai")) return "spring-ai";
  if (text.includes("spring-boot") || text.includes("spring boot")) return "spring-boot";
  if (text.includes("spring-framework") || text.includes("spring framework")) return "spring-framework";
  if (text.includes("java")) return "java";
  return "general";
}
