import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppProgress } from "@/types";

// One-time import of anonymous localStorage progress into the user's DB row.
// If a DB row already exists, merges by taking the union of read/complete items.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Partial<AppProgress>;
  const userId = session.user.id;

  const existing = await prisma.userProgress.findUnique({ where: { userId } });

  const mergedNews = {
    ...(existing?.newsProgress as Record<string, string | null> | undefined ?? {}),
    ...body.newsProgress,
  };
  const mergedLecture = {
    ...(existing?.lectureProgress as Record<string, string | null> | undefined ?? {}),
    ...body.lectureProgress,
  };
  const mergedDailyLog = {
    ...(existing?.dailyLog as Record<string, boolean> | undefined ?? {}),
    ...body.dailyLog,
  };

  const row = await prisma.userProgress.upsert({
    where: { userId },
    update: {
      newsProgress: mergedNews,
      lectureProgress: mergedLecture,
      dailyLog: mergedDailyLog,
    },
    create: {
      userId,
      newsProgress: mergedNews,
      lectureProgress: mergedLecture,
      dailyLog: mergedDailyLog,
    },
  });

  return NextResponse.json({ lastUpdated: row.updatedAt.toISOString() });
}
