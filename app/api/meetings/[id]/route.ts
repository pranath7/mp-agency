import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { meetingSchema } from "@/lib/validations";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = meetingSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { dateTime, ...rest } = parsed.data;

  const meeting = await db.meeting.update({
    where: { id },
    data: {
      ...rest,
      ...(dateTime ? { dateTime: new Date(dateTime) } : {}),
    },
    include: { client: true, project: true },
  });

  return NextResponse.json(meeting);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.meeting.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
