import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { taskSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const tasks = await db.task.findMany({
    where: projectId ? { projectId } : undefined,
    include: { assignedTo: true, project: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { dueDate, ...rest } = parsed.data;

  const task = await db.task.create({
    data: {
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
    include: { assignedTo: true },
  });

  return NextResponse.json(task, { status: 201 });
}
