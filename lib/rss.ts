import Parser from "rss-parser";
import { NewsItem, NewsSource } from "@/types";
import { generateId, stripHtml, truncate, inferCategory } from "./utils";

const parser = new Parser({
  customFields: {
    item: [["category", "category", { keepArray: true }]],
  },
});

export async function fetchSpringBlogRSS(): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL("https://spring.io/blog.atom");
    return (feed.items ?? []).slice(0, 30).map((item) => {
      const url = item.link ?? item.guid ?? "";
      const tags: string[] = Array.isArray(item.category)
        ? (item.category as string[])
        : item.category
        ? [item.category as string]
        : [];
      const rawSummary = item.contentSnippet ?? item.content ?? item.summary ?? "";
      const summary = truncate(stripHtml(rawSummary), 200);

      return {
        id: generateId(url),
        title: item.title ?? "Untitled",
        summary,
        url,
        publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        source: "spring-blog" as NewsSource,
        category: inferCategory(tags, item.title ?? "", summary),
        isRelease: (item.title ?? "").toLowerCase().includes("release"),
      };
    });
  } catch (err) {
    console.error("[rss] Failed to fetch Spring Blog:", err);
    return [];
  }
}
