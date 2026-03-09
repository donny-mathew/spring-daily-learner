import { NewsFeed } from "@/components/news/NewsFeed";
import { NewsItem } from "@/types";

export const revalidate = 3600;

async function getNews(): Promise<NewsItem[]> {
  try {
    const { aggregateNews } = await import("@/lib/aggregator");
    return await aggregateNews();
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--foreground)]">News Feed</h1>
        <p className="text-sm text-[var(--muted)]">
          Latest Spring Boot, Spring AI, and Java news · refreshes hourly
        </p>
      </div>
      <NewsFeed items={news} />
    </div>
  );
}
