import { NewsItem, NewsSource } from "@/types";
import { generateId, stripHtml, truncate, inferCategory } from "./utils";

// Native Atom/RSS parser — no rss-parser dependency, no url.parse() warnings.

function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1].trim() : "";
}

function extractAttrFromTag(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["'][^>]*>`, "i");
  const m = xml.match(re);
  return m ? m[1] : "";
}

function extractAllBlocks(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`, "gi");
  return xml.match(re) ?? [];
}

export async function fetchSpringBlogRSS(): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://spring.io/blog.atom", {
      headers: { "User-Agent": "spring-daily-learner/1.0" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    const entries = extractAllBlocks(xml, "entry");

    return entries.slice(0, 30).map((entry) => {
      // <link rel="alternate" href="..." /> or <link href="..." />
      const urlMatch =
        entry.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*>/i) ??
        entry.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
      const url = urlMatch ? urlMatch[1] : "";

      const title = stripHtml(extractTag(entry, "title"));
      const rawSummary = extractTag(entry, "summary") || extractTag(entry, "content");
      const summary = truncate(stripHtml(rawSummary), 200);
      const publishedAt =
        extractTag(entry, "published") ||
        extractTag(entry, "updated") ||
        new Date().toISOString();

      // Extract all <category term="..." /> values
      const categoryMatches = entry.match(/<category[^>]*term=["'][^"']+["'][^>]*>/gi) ?? [];
      const tags = categoryMatches.map((c) => {
        const m = c.match(/term=["']([^"']+)["']/i);
        return m ? m[1] : "";
      }).filter(Boolean);

      return {
        id: generateId(url),
        title: title || "Untitled",
        summary,
        url,
        publishedAt,
        source: "spring-blog" as NewsSource,
        category: inferCategory(tags, title, summary),
        isRelease: title.toLowerCase().includes("release"),
      };
    });
  } catch (err) {
    console.error("[rss] Failed to fetch Spring Blog:", err);
    return [];
  }
}
