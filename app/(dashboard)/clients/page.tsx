"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, Search, Phone, Mail, Building2, X, Loader2 } from "lucide-react";

function AddClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: any) => void }) {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      onCreated(await res.json());
      onClose();
    } else {
      setError("Failed to create client");
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>New Client</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "4px" }}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {error && <div style={{ color: "#DC2626", fontSize: "13px", marginBottom: "12px" }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Arjun Mehta" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="form-input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="TechNova Solutions" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="arjun@technova.in" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any context about this client…" style={{ resize: "vertical" }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={14} />}
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(d => { setClients(d); setLoading(false); });
  }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Clients</div>
          <div className="page-subtitle">{clients.length} client{clients.length !== 1 ? "s" : ""} in your CRM</div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Add Client
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: "20px" }}>
        <Search size={15} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-muted-foreground)" }} />
        <input
          className="form-input"
          style={{ paddingLeft: "34px", maxWidth: "360px" }}
          placeholder="Search clients…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: "140px" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card" style={{ paddingTop: "48px", paddingBottom: "48px" }}>
          <div className="empty-icon"><Users size={24} color="var(--color-muted-foreground)" /></div>
          <p style={{ fontWeight: 600, marginBottom: "8px" }}>No clients found</p>
          <p style={{ fontSize: "14px" }}>{search ? "Try a different search" : "Add your first client to get started"}</p>
          {!search && (
            <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: "16px" }}>
              <Plus size={16} /> Add Client
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {filtered.map(c => (
            <Link key={c.id} href={`/clients/${c.id}`} style={{ textDecoration: "none" }}>
              <div className="card" style={{ cursor: "pointer", padding: "0" }}>
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                    <div className="avatar" style={{ width: "40px", height: "40px", fontSize: "15px", flexShrink: 0 }}>
                      {c.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--color-foreground)" }}>{c.name}</div>
                      {c.company && (
                        <div style={{ fontSize: "13px", color: "var(--color-muted-foreground)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                          <Building2 size={12} /> {c.company}
                        </div>
                      )}
                    </div>
                    <div style={{
                      background: "var(--color-primary-light)", color: "var(--color-primary)",
                      borderRadius: "20px", padding: "2px 10px", fontSize: "12px", fontWeight: 600,
                    }}>
                      {c._count?.projects ?? 0} project{(c._count?.projects ?? 0) !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {c.email && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--color-muted-foreground)" }}>
                        <Mail size={13} />{c.email}
                      </div>
                    )}
                    {c.phone && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--color-muted-foreground)" }}>
                        <Phone size={13} />{c.phone}
                      </div>
                    )}
                  </div>

                  {c.notes && (
                    <div style={{
                      marginTop: "12px", fontSize: "12px", color: "var(--color-muted-foreground)",
                      background: "var(--color-muted)", borderRadius: "6px", padding: "8px 10px",
                      lineHeight: 1.5,
                    }}>
                      {c.notes.slice(0, 100)}{c.notes.length > 100 ? "…" : ""}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <AddClientModal
          onClose={() => setShowModal(false)}
          onCreated={c => setClients(prev => [c, ...prev])}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
