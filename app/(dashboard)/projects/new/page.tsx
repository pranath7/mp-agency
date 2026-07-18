"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { projectSchema } from "@/lib/validations";

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", clientId: "", description: "", status: "active",
    startDate: "", deadline: "", totalValue: "",
  });
  const [clients, setClients] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inline Client form states
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "", company: "", email: "", phone: "",
  });

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    let resolvedClientId = form.clientId;

    // Handle inline client creation first if checked
    if (showNewClientForm) {
      if (!newClient.name.trim()) {
        setErrors(prev => ({ ...prev, clientName: "Client name is required" }));
        return;
      }
      setSaving(true);
      const clientRes = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });

      if (clientRes.ok) {
        const createdClient = await clientRes.json();
        resolvedClientId = createdClient.id;
      } else {
        const errData = await clientRes.json();
        setErrors(prev => ({ ...prev, clientName: errData.error || "Failed to create client" }));
        setSaving(false);
        return;
      }
    }

    const parsed = projectSchema.safeParse({
      ...form,
      clientId: resolvedClientId,
      totalValue: Number(form.totalValue) || 0,
    });

    if (!parsed.success) {
      const errs = parsed.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, v?.[0] ?? ""])));
      setSaving(false);
      return;
    }

    setSaving(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (res.ok) {
      const project = await res.json();
      router.push(`/projects/${project.id}`);
    } else {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: "640px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>New Project</h1>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. TechNova Website Redesign"
                autoFocus
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            {/* Client Context Section with inline toggle */}
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="form-label" style={{ margin: 0 }}>Client *</label>
                <button
                  type="button"
                  onClick={() => setShowNewClientForm(!showNewClientForm)}
                  className="btn btn-ghost btn-xs"
                  style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-primary)" }}
                >
                  {showNewClientForm ? "Select Existing Client" : "+ Add New Client"}
                </button>
              </div>

              {showNewClientForm ? (
                <div style={{ padding: "14px", border: "1px solid var(--color-border)", borderRadius: "10px", background: "var(--color-muted)", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-foreground)" }}>New Client Details</div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "11px" }}>Client Name *</label>
                    <input
                      className="form-input"
                      style={{ fontSize: "13px", padding: "6px 10px" }}
                      value={newClient.name}
                      onChange={e => setNewClient(nc => ({ ...nc, name: e.target.value }))}
                      placeholder="e.g. Shiv Kumar"
                    />
                    {errors.clientName && <p className="form-error">{errors.clientName}</p>}
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "11px" }}>Company</label>
                    <input
                      className="form-input"
                      style={{ fontSize: "13px", padding: "6px 10px" }}
                      value={newClient.company}
                      onChange={e => setNewClient(nc => ({ ...nc, company: e.target.value }))}
                      placeholder="e.g. RS Ply Decor"
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "11px" }}>Email</label>
                      <input
                        className="form-input"
                        style={{ fontSize: "13px", padding: "6px 10px" }}
                        type="email"
                        value={newClient.email}
                        onChange={e => setNewClient(nc => ({ ...nc, email: e.target.value }))}
                        placeholder="client@domain.com"
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "11px" }}>Phone</label>
                      <input
                        className="form-input"
                        style={{ fontSize: "13px", padding: "6px 10px" }}
                        value={newClient.phone}
                        onChange={e => setNewClient(nc => ({ ...nc, phone: e.target.value }))}
                        placeholder="+91..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <select
                    className="form-select"
                    value={form.clientId}
                    onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                  >
                    <option value="">Select a client…</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>
                    ))}
                  </select>
                  {errors.clientId && <p className="form-error">{errors.clientId}</p>}
                </>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Scope, deliverables, or any context…"
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Total Value (₹)</label>
                <input
                  className="form-input" type="number" min="0"
                  value={form.totalValue}
                  onChange={e => setForm(f => ({ ...f, totalValue: e.target.value }))}
                  placeholder="125000"
                />
                {errors.totalValue && <p className="form-error">{errors.totalValue}</p>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Deadline</label>
                <input className="form-input" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
            </div>

            <hr className="divider" />

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => router.back()} className="btn btn-outline">Cancel</button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? (
                  <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Creating…</>
                ) : (
                  <><Save size={14} /> Create Project</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
