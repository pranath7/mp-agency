import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectSchema } from "@/lib/validations";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    include: {
      client: true,
      tasks: { include: { assignedTo: true }, orderBy: { createdAt: "asc" } },
      invoices: { orderBy: { issueDate: "desc" } },
      expenses: { orderBy: { date: "desc" } },
      meetings: { include: { client: true }, orderBy: { dateTime: "asc" } },
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = projectSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { startDate, deadline, ...rest } = parsed.data;

  const project = await db.project.update({
    where: { id },
    data: {
      ...rest,
      ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
      ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {}),
    },
    include: { client: true },
  });

  return NextResponse.json(project);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
