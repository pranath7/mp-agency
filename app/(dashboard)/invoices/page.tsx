"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FileText, Plus, IndianRupee, Check, Filter } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

const statusOptions = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

function InvoicesContent() {
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "");

  useEffect(() => {
    fetch("/api/invoices").then(r => r.json()).then(d => { setInvoices(d); setLoading(false); });
  }, []);

  const filtered = invoices.filter(i => !statusFilter || i.status === statusFilter);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  async function markPaid(id: string) {
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", paidDate: new Date().toISOString() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setInvoices(prev => prev.map(i => i.id === id ? updated : i));
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Invoices</div>
          <div className="page-subtitle">{invoices.length} invoices total</div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Pending", amount: totalPending, count: invoices.filter(i => i.status === "pending").length, color: "#D97706", bg: "#fffbeb" },
          { label: "Collected", amount: totalPaid, count: invoices.filter(i => i.status === "paid").length, color: "#059669", bg: "#ecfdf5" },
          { label: "Overdue", amount: totalOverdue, count: invoices.filter(i => i.status === "overdue").length, color: "#DC2626", bg: "#fef2f2" },
        ].map(({ label, amount, count, color, bg }) => (
          <div key={label} style={{ background: "white", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "18px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: "13px", color: "var(--color-muted-foreground)", marginBottom: "6px" }}>{label}</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(amount)}</div>
            <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)", marginTop: "4px" }}>{count} invoice{count !== 1 ? "s" : ""}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
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

      <div className="card">
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: "32px 20px" }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: "44px", marginBottom: "10px" }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><FileText size={24} color="var(--color-muted-foreground)" /></div>
              <p style={{ fontWeight: 600, marginBottom: "8px" }}>No invoices {statusFilter ? `with status "${statusFilter}"` : ""}</p>
              <p style={{ fontSize: "14px" }}>Create invoices from within a project workspace</p>
              <Link href="/projects" className="btn btn-primary" style={{ marginTop: "16px" }}>
                Go to Projects
              </Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th>Paid On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <Link href={`/projects/${inv.project?.id}`} style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>
                        {inv.project?.name}
                      </Link>
                    </td>
                    <td style={{ color: "var(--color-muted-foreground)" }}>{inv.project?.client?.name}</td>
                    <td style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(inv.amount)}</td>
                    <td><span className={`badge ${getStatusColor(inv.status)}`}>{getStatusLabel(inv.status)}</span></td>
                    <td style={{ fontSize: "13px" }}>{formatDate(inv.issueDate)}</td>
                    <td style={{
                      fontSize: "13px",
                      color: inv.status === "overdue" ? "#DC2626" : "var(--color-foreground)",
                      fontWeight: inv.status === "overdue" ? 600 : 400,
                    }}>
                      {formatDate(inv.dueDate)}
                    </td>
                    <td style={{ fontSize: "13px", color: "var(--color-muted-foreground)" }}>
                      {inv.paidDate ? formatDate(inv.paidDate) : "—"}
                    </td>
                    <td>
                      {inv.status !== "paid" && (
                        <button
                          onClick={() => markPaid(inv.id)}
                          className="btn btn-xs"
                          style={{ background: "#dcfce7", color: "#15803d", border: "none", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <Check size={11} /> Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading invoices...</div>}>
      <InvoicesContent />
    </Suspense>
  );
}
