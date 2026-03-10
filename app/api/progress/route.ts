import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppProgress } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await prisma.userProgress.findUnique({
    where: { userId: session.user.id },
  });

  if (!row) {
    return NextResponse.json({
      newsProgress: {},
      lectureProgress: {},
      dailyLog: {},
      lastUpdated: new Date().toISOString(),
    } satisfies AppProgress);
  }

  return NextResponse.json({
    newsProgress: row.newsProgress as AppProgress["newsProgress"],
    lectureProgress: row.lectureProgress as AppProgress["lectureProgress"],
    dailyLog: row.dailyLog as AppProgress["dailyLog"],
    lastUpdated: row.updatedAt.toISOString(),
  } satisfies AppProgress);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Partial<AppProgress>;

  const row = await prisma.userProgress.upsert({
    where: { userId: session.user.id },
    update: {
      newsProgress: body.newsProgress ?? undefined,
      lectureProgress: body.lectureProgress ?? undefined,
      dailyLog: body.dailyLog ?? undefined,
    },
    create: {
      userId: session.user.id,
      newsProgress: body.newsProgress ?? {},
      lectureProgress: body.lectureProgress ?? {},
      dailyLog: body.dailyLog ?? {},
    },
  });

  return NextResponse.json({ lastUpdated: row.updatedAt.toISOString() });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.userProgress.deleteMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
