"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building2, Edit2, FolderKanban, Calendar } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then(d => { setClient(d); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: "32px", width: "200px", marginBottom: "20px" }} />
        <div className="skeleton" style={{ height: "180px", marginBottom: "16px" }} />
        <div className="skeleton" style={{ height: "300px" }} />
      </div>
    );
  }

  if (!client) return <div className="empty-state"><p>Client not found</p></div>;

  const totalValue = client.projects.reduce((s: number, p: any) => s + p.totalValue, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>{client.name}</h1>
          {client.company && <div style={{ fontSize: "14px", color: "var(--color-muted-foreground)" }}>{client.company}</div>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "20px", alignItems: "start" }}>
        {/* Left: Details card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="avatar" style={{ width: "44px", height: "44px", fontSize: "17px" }}>
                {client.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "15px" }}>{client.name}</div>
                {client.company && <div style={{ fontSize: "13px", color: "var(--color-muted-foreground)" }}>{client.company}</div>}
              </div>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {client.email && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                  <Mail size={15} color="var(--color-muted-foreground)" />
                  <a href={`mailto:${client.email}`} style={{ color: "var(--color-primary)", textDecoration: "none" }}>{client.email}</a>
                </div>
              )}
              {client.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                  <Phone size={15} color="var(--color-muted-foreground)" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.company && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                  <Building2 size={15} color="var(--color-muted-foreground)" />
                  <span>{client.company}</span>
                </div>
              )}
            </div>

            {client.notes && (
              <>
                <hr className="divider" />
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-muted-foreground)", marginBottom: "8px" }}>Notes</div>
                  <p style={{ fontSize: "14px", lineHeight: 1.6, margin: 0, color: "var(--color-foreground)" }}>{client.notes}</p>
                </div>
              </>
            )}

            <hr className="divider" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", textAlign: "center" }}>
              <div style={{ background: "var(--color-muted)", borderRadius: "8px", padding: "12px 8px" }}>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-primary)" }}>{client.projects.length}</div>
                <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>Projects</div>
              </div>
              <div style={{ background: "var(--color-muted)", borderRadius: "8px", padding: "12px 8px" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#059669" }}>{formatCurrency(totalValue)}</div>
                <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>Total Value</div>
              </div>
            </div>

            <div style={{ marginTop: "14px" }}>
              <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>
                Client since {formatDate(client.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Projects */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Projects</h2>
            <Link href="/projects/new" className="btn btn-primary btn-sm">
              <FolderKanban size={14} /> New Project
            </Link>
          </div>

          {client.projects.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <FolderKanban size={32} color="var(--color-muted-foreground)" />
                <p style={{ marginTop: "12px" }}>No projects yet for this client</p>
                <Link href="/projects/new" className="btn btn-primary" style={{ marginTop: "12px" }}>
                  Create First Project
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {client.projects.map((p: any) => {
                const doneTasks = p.tasks.filter((t: any) => t.status === "done").length;
                const paid = p.invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + i.amount, 0);
                return (
                  <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: "none" }}>
                    <div className="card" style={{ padding: "0" }}>
                      <div style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--color-foreground)" }}>{p.name}</div>
                            {p.deadline && (
                              <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Calendar size={11} /> Deadline: {formatDate(p.deadline)}
                              </div>
                            )}
                          </div>
                          <span className={`badge ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span>
                        </div>
                        <div style={{ display: "flex", gap: "20px", fontSize: "13px" }}>
                          <div>
                            <span style={{ color: "var(--color-muted-foreground)" }}>Value: </span>
                            <span style={{ fontWeight: 600 }}>{formatCurrency(p.totalValue)}</span>
                          </div>
                          <div>
                            <span style={{ color: "var(--color-muted-foreground)" }}>Collected: </span>
                            <span style={{ fontWeight: 600, color: "#059669" }}>{formatCurrency(paid)}</span>
                          </div>
                          <div>
                            <span style={{ color: "var(--color-muted-foreground)" }}>Tasks: </span>
                            <span style={{ fontWeight: 600 }}>{doneTasks}/{p.tasks.length} done</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
