import { NextResponse } from "next/server";
import { aggregateNews } from "@/lib/aggregator";

export const revalidate = 3600; // 1 hour ISR

export async function GET() {
  try {
    const items = await aggregateNews();
    return NextResponse.json(items);
  } catch (err) {
    console.error("[api/news] aggregation failed:", err);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
