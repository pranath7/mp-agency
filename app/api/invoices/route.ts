import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoiceSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await db.invoice.findMany({
    include: { project: { include: { client: true } } },
    orderBy: { issueDate: "desc" },
  });

  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const invoice = await db.invoice.create({
    data: {
      ...parsed.data,
      issueDate: new Date(parsed.data.issueDate),
      dueDate: new Date(parsed.data.dueDate),
      paidDate: parsed.data.paidDate ? new Date(parsed.data.paidDate) : null,
    },
    include: { project: { include: { client: true } } },
  });

  return NextResponse.json(invoice, { status: 201 });
}
