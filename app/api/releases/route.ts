import { NextResponse } from "next/server";
import { fetchGitHubReleases } from "@/lib/github";

export const revalidate = 3600;

export async function GET() {
  try {
    const releases = await fetchGitHubReleases();
    return NextResponse.json(releases);
  } catch (err) {
    console.error("[api/releases] fetch failed:", err);
    return NextResponse.json({ error: "Failed to fetch releases" }, { status: 500 });
  }
}
