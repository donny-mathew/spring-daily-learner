import { NewsItem } from "@/types";
import { fetchSpringBlogRSS } from "./rss";
import { fetchGitHubReleases } from "./github";

export async function aggregateNews(): Promise<NewsItem[]> {
  const [blogItems, releaseItems] = await Promise.allSettled([
    fetchSpringBlogRSS(),
    fetchGitHubReleases(),
  ]);

  const blog = blogItems.status === "fulfilled" ? blogItems.value : [];
  const releases = releaseItems.status === "fulfilled" ? releaseItems.value : [];

  // Merge and deduplicate by ID
  const seen = new Set<string>();
  const merged: NewsItem[] = [];

  for (const item of [...blog, ...releases]) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }

  // Sort newest first
  return merged.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
