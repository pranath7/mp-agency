"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderKanban, FileText, IndianRupee, Calendar,
  TrendingUp, AlertCircle, ArrowRight, Clock, CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatDateTime, getStatusColor, getStatusLabel } from "@/lib/utils";

interface DashboardData {
  activeProjects: number;
  pendingInvoicesAmount: number;
  pendingInvoicesCount: number;
  paidThisMonth: number;
  upcomingMeetingsCount: number;
  upcomingMeetings: any[];
  overdueInvoices: any[];
  recentProjects: any[];
}

function StatCard({ icon, label, value, sub, color, href }: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
  color: string; href?: string;
}) {
  const content = (
    <div className="stat-card" style={{ cursor: href ? "pointer" : "default" }}>
      <div className="stat-icon" style={{ background: color + "18" }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && (
        <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)", marginTop: "4px" }}>
          {sub}
        </div>
      )}
    </div>
  );
  return href ? <Link href={href} style={{ textDecoration: "none" }}>{content}</Link> : content;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">Dashboard</div>
            <div className="page-subtitle">Welcome back! Here's what's happening.</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "120px" }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data || (data as any).error) {
    if (!loading && (data as any)?.error) {
      return (
        <div className="card" style={{ padding: "24px", textAlign: "center" }}>
          <p style={{ color: "#DC2626", fontWeight: 600 }}>Error loading dashboard: {(data as any).error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: "12px" }}>
            Retry
          </button>
        </div>
      );
    }
    return null;
  }

  const {
    activeProjects = 0,
    pendingInvoicesAmount = 0,
    pendingInvoicesCount = 0,
    paidThisMonth = 0,
    upcomingMeetingsCount = 0,
    upcomingMeetings = [],
    overdueInvoices = [],
    recentProjects = [],
  } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Welcome back! Here's what's happening today.</div>
        </div>
        <Link href="/projects/new" className="btn btn-primary">
          <FolderKanban size={16} />
          New Project
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard
          icon={<FolderKanban size={20} />}
          label="Active Projects"
          value={String(activeProjects)}
          color="#2563EB"
          href="/projects?status=active"
        />
        <StatCard
          icon={<FileText size={20} />}
          label="Pending Invoices"
          value={formatCurrency(pendingInvoicesAmount)}
          sub={`${pendingInvoicesCount} invoice${pendingInvoicesCount !== 1 ? "s" : ""}`}
          color="#D97706"
          href="/invoices?status=pending"
        />
        <StatCard
          icon={<IndianRupee size={20} />}
          label="Paid This Month"
          value={formatCurrency(paidThisMonth)}
          color="#059669"
        />
        <StatCard
          icon={<Calendar size={20} />}
          label="Upcoming Meetings"
          value={String(upcomingMeetingsCount)}
          sub="Next 7 days"
          color="#7C3AED"
          href="/meetings"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Overdue Invoices */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={16} color="#DC2626" />
              <span style={{ fontWeight: 600, fontSize: "15px" }}>Overdue Invoices</span>
              {overdueInvoices.length > 0 && (
                <span className="badge status-overdue">{overdueInvoices.length}</span>
              )}
            </div>
            <Link href="/invoices?status=overdue" style={{ fontSize: "13px", color: "var(--color-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="card-body">
            {overdueInvoices.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px" }}>
                <CheckCircle2 size={32} color="#059669" />
                <p style={{ marginTop: "12px", fontSize: "14px" }}>No overdue invoices! 🎉</p>
              </div>
            ) : (
              <div>
                {overdueInvoices.map((inv: any) => (
                  <div key={inv.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 0", borderBottom: "1px solid var(--color-border)",
                  }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "14px" }}>{inv.project?.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>
                        {inv.project?.client?.name} · Due {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: "#DC2626", fontVariantNumeric: "tabular-nums" }}>
                        {formatCurrency(inv.amount)}
                      </div>
                      <span className="badge status-overdue" style={{ fontSize: "11px" }}>Overdue</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={16} color="#7C3AED" />
              <span style={{ fontWeight: 600, fontSize: "15px" }}>Upcoming Meetings</span>
            </div>
            <Link href="/meetings" style={{ fontSize: "13px", color: "var(--color-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="card-body">
            {upcomingMeetings.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px" }}>
                <Clock size={32} color="var(--color-muted-foreground)" />
                <p style={{ marginTop: "12px", fontSize: "14px" }}>No meetings in next 7 days</p>
              </div>
            ) : (
              <div>
                {upcomingMeetings.map((m: any) => (
                  <div key={m.id} style={{
                    display: "flex", alignItems: "flex-start", gap: "12px",
                    padding: "10px 0", borderBottom: "1px solid var(--color-border)",
                  }}>
                    <div style={{
                      background: "var(--color-primary-light)", color: "var(--color-primary)",
                      borderRadius: "8px", padding: "6px 10px", textAlign: "center",
                      flexShrink: 0, minWidth: "48px",
                    }}>
                      <div style={{ fontSize: "18px", fontWeight: 700, lineHeight: 1.1 }}>
                        {new Date(m.dateTime).getDate()}
                      </div>
                      <div style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em" }}>
                        {new Date(m.dateTime).toLocaleString("en-IN", { month: "short" })}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>
                        {m.client?.name} · {new Date(m.dateTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <span className="badge status-active" style={{ fontSize: "11px", flexShrink: 0 }}>Scheduled</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={16} color="var(--color-primary)" />
              <span style={{ fontWeight: 600, fontSize: "15px" }}>Recent Projects</span>
            </div>
            <Link href="/projects" style={{ fontSize: "13px", color: "var(--color-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="card-body" style={{ padding: "0 20px 16px" }}>
            <div className="overflow-x-auto w-full">
              <table className="data-table min-w-[600px]">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Tasks</th>
                  <th>Value</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((p: any) => {
                  const doneTasks = p.tasks.filter((t: any) => t.status === "done").length;
                  const totalTasks = p.tasks.length;
                  return (
                    <tr key={p.id} onClick={() => window.location.href = `/projects/${p.id}`}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td style={{ color: "var(--color-muted-foreground)" }}>{p.client?.name}</td>
                      <td><span className={`badge ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ flex: 1, height: "4px", background: "var(--color-border)", borderRadius: "2px", minWidth: "60px" }}>
                            <div style={{ height: "100%", background: "var(--color-accent)", borderRadius: "2px", width: totalTasks > 0 ? `${(doneTasks / totalTasks) * 100}%` : "0%" }} />
                          </div>
                          <span style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>{doneTasks}/{totalTasks}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(p.totalValue)}</td>
                      <td style={{ color: "var(--color-muted-foreground)", fontSize: "13px" }}>
                        {p.deadline ? new Date(p.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
