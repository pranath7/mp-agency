import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfMonth, endOfMonth, addDays } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const next7Days = addDays(now, 7);

  const [
    activeProjects,
    pendingInvoices,
    paidThisMonth,
    upcomingMeetings,
    overdueInvoices,
    recentProjects,
  ] = await Promise.all([
    // Count active projects
    db.project.count({ where: { status: "active" } }),

    // Sum pending invoices
    db.invoice.aggregate({
      where: { status: "pending" },
      _sum: { amount: true },
      _count: true,
    }),

    // Sum paid invoices this month
    db.invoice.aggregate({
      where: {
        status: "paid",
        paidDate: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),

    // Meetings in next 7 days
    db.meeting.findMany({
      where: {
        status: "scheduled",
        dateTime: { gte: now, lte: next7Days },
      },
      include: { client: true, project: true },
      orderBy: { dateTime: "asc" },
      take: 10,
    }),

    // Overdue invoices
    db.invoice.findMany({
      where: { status: "overdue" },
      include: { project: { include: { client: true } } },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),

    // Recent projects
    db.project.findMany({
      include: { client: true, tasks: true, invoices: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    activeProjects,
    pendingInvoicesAmount: pendingInvoices._sum.amount ?? 0,
    pendingInvoicesCount: pendingInvoices._count,
    paidThisMonth: paidThisMonth._sum.amount ?? 0,
    upcomingMeetingsCount: upcomingMeetings.length,
    upcomingMeetings,
    overdueInvoices,
    recentProjects,
  });
}
