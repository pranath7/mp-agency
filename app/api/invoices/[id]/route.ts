import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const invoice = await db.invoice.update({
    where: { id },
    data: {
      ...body,
      ...(body.issueDate ? { issueDate: new Date(body.issueDate) } : {}),
      ...(body.dueDate ? { dueDate: new Date(body.dueDate) } : {}),
      ...(body.paidDate ? { paidDate: new Date(body.paidDate) } : {}),
    },
    include: { project: { include: { client: true } } },
  });

  return NextResponse.json(invoice);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
