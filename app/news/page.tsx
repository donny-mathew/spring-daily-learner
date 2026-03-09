import { SpringUpdatesFeed } from "@/components/news/SpringUpdatesFeed";
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
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Spring Framework Updates</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Stay current with the latest news, releases, and tutorials from the Spring ecosystem
        </p>
      </div>
      <SpringUpdatesFeed items={news} />
    </div>
  );
}
