"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Plus } from "lucide-react";
import { projectSchema } from "@/lib/validations";

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const isNew = id === undefined;

  const [form, setForm] = useState({
    name: "", clientId: "", description: "", status: "active",
    startDate: "", deadline: "", totalValue: "",
  });
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients);
    if (!isNew) {
      fetch(`/api/projects/${id}`).then(r => r.json()).then(p => {
        setForm({
          name: p.name ?? "",
          clientId: p.clientId ?? "",
          description: p.description ?? "",
          status: p.status ?? "active",
          startDate: p.startDate ? p.startDate.split("T")[0] : "",
          deadline: p.deadline ? p.deadline.split("T")[0] : "",
          totalValue: String(p.totalValue ?? ""),
        });
        setLoading(false);
      });
    }
  }, [id, isNew]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = projectSchema.safeParse({
      ...form,
      totalValue: Number(form.totalValue) || 0,
    });

    if (!parsed.success) {
      const errs = parsed.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, v?.[0] ?? ""])));
      return;
    }

    setSaving(true);
    const url = isNew ? "/api/projects" : `/api/projects/${id}`;
    const method = isNew ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
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

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}><Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /></div>;
  }

  return (
    <div style={{ maxWidth: "640px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>
          {isNew ? "New Project" : "Edit Project"}
        </h1>
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

            <div className="form-group">
              <label className="form-label">Client *</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  className="form-select"
                  value={form.clientId}
                  onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                  style={{ flex: 1 }}
                >
                  <option value="">Select a client…</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>
                  ))}
                </select>
                <Link href="/clients" className="btn btn-outline btn-sm" style={{ whiteSpace: "nowrap" }}>
                  <Plus size={14} /> New Client
                </Link>
              </div>
              {errors.clientId && <p className="form-error">{errors.clientId}</p>}
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
                <select
                  className="form-select"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Total Value (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
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
                <input
                  className="form-input"
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Deadline</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                />
              </div>
            </div>

            <hr className="divider" />

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => router.back()} className="btn btn-outline">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? (
                  <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
                ) : (
                  <><Save size={14} /> {isNew ? "Create Project" : "Save Changes"}</>
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
