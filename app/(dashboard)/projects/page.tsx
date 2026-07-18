"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FolderKanban, Plus, Search, Filter } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

const statusOptions = [
  { value: "", label: "All Projects" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "on-hold", label: "On Hold" },
];

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const url = statusFilter ? `/api/projects?status=${statusFilter}` : "/api/projects";
    fetch(url).then(r => r.json()).then(d => { setProjects(d); setLoading(false); });
  }, [statusFilter]);

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getPendingAmount = (p: any) =>
    (p.invoices ?? []).filter((i: any) => i.status === "pending" || i.status === "overdue")
      .reduce((sum: number, i: any) => sum + i.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-subtitle">{projects.length} total project{projects.length !== 1 ? "s" : ""}</div>
        </div>
        <Link href="/projects/new" className="btn btn-primary">
          <Plus size={16} />
          New Project
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
          <Search size={15} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-muted-foreground)" }} />
          <input
            className="form-input"
            style={{ paddingLeft: "34px" }}
            placeholder="Search projects or clients…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              className={`btn btn-sm ${statusFilter === opt.value ? "btn-primary" : "btn-outline"}`}
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: "32px 20px" }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "44px", marginBottom: "10px" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><FolderKanban size={24} color="var(--color-muted-foreground)" /></div>
              <p style={{ fontWeight: 600, marginBottom: "8px" }}>No projects found</p>
              <p style={{ fontSize: "14px" }}>
                {search ? "Try a different search term" : "Create your first project to get started"}
              </p>
              {!search && (
                <Link href="/projects/new" className="btn btn-primary" style={{ marginTop: "16px" }}>
                  <Plus size={16} /> New Project
                </Link>
              )}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>Value</th>
                  <th>Pending</th>
                  <th>Tasks</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: any) => {
                  const doneTasks = (p.tasks ?? []).filter((t: any) => t.status === "done").length;
                  const totalTasks = (p.tasks ?? []).length;
                  const daysLeft = p.deadline
                    ? Math.ceil((new Date(p.deadline).getTime() - Date.now()) / 86400000)
                    : null;

                  return (
                    <tr key={p.id} onClick={() => window.location.href = `/projects/${p.id}`}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: "14px" }}>{p.name}</div>
                        {p.description && (
                          <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)", marginTop: "2px" }}>
                            {p.description.slice(0, 60)}{p.description.length > 60 ? "…" : ""}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: "14px" }}>{p.client?.name}</div>
                        {p.client?.company && (
                          <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>{p.client.company}</div>
                        )}
                      </td>
                      <td><span className={`badge ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span></td>
                      <td>
                        {p.deadline ? (
                          <div>
                            <div style={{ fontSize: "13px" }}>{formatDate(p.deadline)}</div>
                            {daysLeft !== null && (
                              <div style={{
                                fontSize: "11px",
                                color: daysLeft < 0 ? "#DC2626" : daysLeft < 7 ? "#D97706" : "var(--color-muted-foreground)",
                                fontWeight: daysLeft < 7 ? 600 : 400,
                              }}>
                                {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Today" : `${daysLeft}d left`}
                              </div>
                            )}
                          </div>
                        ) : "—"}
                      </td>
                      <td style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(p.totalValue)}</td>
                      <td style={{ color: getPendingAmount(p) > 0 ? "#D97706" : "var(--color-muted-foreground)", fontVariantNumeric: "tabular-nums", fontWeight: getPendingAmount(p) > 0 ? 600 : 400 }}>
                        {formatCurrency(getPendingAmount(p))}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "56px", height: "4px", background: "var(--color-border)", borderRadius: "2px" }}>
                            <div style={{ height: "100%", background: "var(--color-accent)", borderRadius: "2px", width: totalTasks > 0 ? `${(doneTasks / totalTasks) * 100}%` : "0%" }} />
                          </div>
                          <span style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>{doneTasks}/{totalTasks}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
