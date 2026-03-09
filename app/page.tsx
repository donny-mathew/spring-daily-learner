import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { NewsItem } from "@/types";

// Server component — fetch news server-side with ISR
async function getNews(): Promise<NewsItem[]> {
  try {
    // In production this calls our own ISR API route.
    // During build / SSR we import the aggregator directly to avoid
    // circular self-fetch (Next.js doesn't allow fetching localhost at build time).
    const { aggregateNews } = await import("@/lib/aggregator");
    return await aggregateNews();
  } catch {
    return [];
  }
}

export const revalidate = 3600;

export default async function DashboardPage() {
  const news = await getNews();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-sm text-[var(--muted)]">
          Your daily Spring Boot learning hub
        </p>
      </div>
      <DashboardShell news={news} />
    </div>
  );
}
