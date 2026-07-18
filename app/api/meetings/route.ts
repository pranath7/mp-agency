import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { meetingSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // "2026-07"

  let where = {};
  if (month) {
    const [year, m] = month.split("-").map(Number);
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 0, 23, 59, 59);
    where = { dateTime: { gte: start, lte: end } };
  }

  const meetings = await db.meeting.findMany({
    where,
    include: { client: true, project: true },
    orderBy: { dateTime: "asc" },
  });

  return NextResponse.json(meetings);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = meetingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const meeting = await db.meeting.create({
    data: {
      ...parsed.data,
      dateTime: new Date(parsed.data.dateTime),
      projectId: parsed.data.projectId || null,
    },
    include: { client: true, project: true },
  });

  return NextResponse.json(meeting, { status: 201 });
}
