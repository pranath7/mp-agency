import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const projects = await db.project.findMany({
    where: status ? { status } : undefined,
    include: {
      client: true,
      tasks: true,
      invoices: true,
      _count: { select: { tasks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { startDate, deadline, ...rest } = parsed.data;

  const project = await db.project.create({
    data: {
      ...rest,
      startDate: startDate ? new Date(startDate) : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
    },
    include: { client: true },
  });

  return NextResponse.json(project, { status: 201 });
}
