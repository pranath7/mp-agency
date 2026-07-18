"use client";

import { useEffect, useState, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, isSameMonth, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Calendar, Clock, User2, FolderKanban } from "lucide-react";
import { formatDateTime, getStatusColor, getStatusLabel } from "@/lib/utils";

function AddMeetingModal({ clients, projects, onClose, onCreated }: {
  clients: any[]; projects: any[]; onClose: () => void; onCreated: (m: any) => void;
}) {
  const [form, setForm] = useState({
    title: "", clientId: "", projectId: "", dateTime: "", notes: "", status: "scheduled",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.clientId || !form.dateTime) {
      setError("Title, client and date/time are required");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, projectId: form.projectId || null }),
    });
    if (res.ok) {
      onCreated(await res.json());
      onClose();
    } else {
      setError("Failed to create meeting");
      setSaving(false);
    }
  }

  const clientProjects = form.clientId ? projects.filter(p => p.clientId === form.clientId) : projects;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>Schedule Meeting</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "4px" }}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {error && <div style={{ color: "#DC2626", fontSize: "13px", marginBottom: "12px" }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. TechNova Design Review" autoFocus />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Client *</label>
                <select className="form-select" value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value, projectId: "" }))}>
                  <option value="">Select client…</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Project (optional)</label>
                <select
                  className="form-select"
                  value={form.projectId}
                  onChange={e => {
                    const val = e.target.value;
                    if (val) {
                      const proj = projects.find(p => p.id === val);
                      if (proj) {
                        setForm(f => ({ ...f, projectId: val, clientId: proj.clientId }));
                        return;
                      }
                    }
                    setForm(f => ({ ...f, projectId: val }));
                  }}
                >
                  <option value="">None</option>
                  {clientProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Date & Time *</label>
              <input className="form-input" type="datetime-local" value={form.dateTime} onChange={e => setForm(f => ({ ...f, dateTime: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Agenda, prep notes…" style={{ resize: "vertical" }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={14} />}
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reschedulingMeetingId, setReschedulingMeetingId] = useState<string | null>(null);
  const [rescheduleDateTime, setRescheduleDateTime] = useState("");

  const fetchMeetings = useCallback(() => {
    const month = format(currentMonth, "yyyy-MM");
    fetch(`/api/meetings?month=${month}`).then(r => r.json()).then(d => { setMeetings(d); setLoading(false); });
  }, [currentMonth]);

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then(r => r.json()),
      fetch("/api/projects").then(r => r.json()),
    ]).then(([c, p]) => { setClients(c); setProjects(p); });
  }, []);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayOffset = getDay(startOfMonth(currentMonth));

  const getMeetingsForDay = (day: Date) =>
    meetings.filter(m => isSameDay(new Date(m.dateTime), day));

  const selectedDayMeetings = selectedDay ? getMeetingsForDay(selectedDay) : [];

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/meetings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMeetings(prev => prev.map(m => m.id === id ? updated : m));
    }
  }

  async function rescheduleMeeting(meetingId: string) {
    if (!rescheduleDateTime) return;
    const res = await fetch(`/api/meetings/${meetingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dateTime: rescheduleDateTime }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMeetings(prev => prev.map(m => m.id === meetingId ? updated : m));
      setReschedulingMeetingId(null);
    }
  }

  async function deleteMeeting(id: string) {
    if (!confirm("Delete this meeting?")) return;
    await fetch(`/api/meetings/${id}`, { method: "DELETE" });
    setMeetings(prev => prev.filter(m => m.id !== id));
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Meetings</div>
          <div className="page-subtitle">{meetings.length} meeting{meetings.length !== 1 ? "s" : ""} this month</div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Schedule Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
        {/* Calendar */}
        <div className="card">
          {/* Month nav */}
          <div className="card-header" style={{ paddingBottom: "16px" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontWeight: 700, fontSize: "16px" }}>
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: "12px", fontWeight: 600, color: "var(--color-muted-foreground)", padding: "4px 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {d}
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
              {/* Empty cells for offset */}
              {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}
              {days.map(day => {
                const dayMeetings = getMeetingsForDay(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const todayDay = isToday(day);
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      padding: "6px 4px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: isSelected ? "var(--color-primary)" : todayDay ? "var(--color-primary-light)" : "transparent",
                      transition: "background 150ms",
                      minHeight: "64px",
                      position: "relative",
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--color-muted)"; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = todayDay ? "var(--color-primary-light)" : "transparent"; }}
                  >
                    <div style={{
                      fontSize: "13px", fontWeight: 600, textAlign: "center", marginBottom: "4px",
                      color: isSelected ? "white" : todayDay ? "var(--color-primary)" : "var(--color-foreground)",
                    }}>
                      {format(day, "d")}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", justifyContent: "center" }}>
                      {dayMeetings.slice(0, 3).map(m => (
                        <div key={m.id} style={{
                          width: "6px", height: "6px", borderRadius: "50%",
                          background: isSelected ? "rgba(255,255,255,0.7)" : m.status === "completed" ? "#059669" : m.status === "cancelled" ? "#94a3b8" : "var(--color-primary)",
                        }} />
                      ))}
                      {dayMeetings.length > 3 && (
                        <div style={{ fontSize: "10px", color: isSelected ? "rgba(255,255,255,0.8)" : "var(--color-muted-foreground)" }}>+{dayMeetings.length - 3}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day detail */}
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px" }}>
                {selectedDay ? format(selectedDay, "EEEE, d MMMM") : "Select a day"}
              </div>
              <div style={{ fontSize: "13px", color: "var(--color-muted-foreground)", marginTop: "2px" }}>
                {selectedDayMeetings.length} meeting{selectedDayMeetings.length !== 1 ? "s" : ""}
              </div>
            </div>
            <button onClick={() => setShowModal(true)} className="btn btn-outline btn-sm">
              <Plus size={14} />
            </button>
          </div>
          <div className="card-body">
            {selectedDayMeetings.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px" }}>
                <Calendar size={28} color="var(--color-muted-foreground)" />
                <p style={{ marginTop: "10px", fontSize: "14px" }}>No meetings on this day</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {selectedDayMeetings.map(m => (
                  <div key={m.id} style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "10px",
                    padding: "14px",
                    borderLeft: `3px solid ${m.status === "completed" ? "#059669" : m.status === "cancelled" ? "#94a3b8" : "#2563EB"}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
                      <div style={{ fontWeight: 600, fontSize: "14px" }}>{m.title}</div>
                      <span className={`badge ${getStatusColor(m.status)}`} style={{ fontSize: "11px", flexShrink: 0 }}>
                        {getStatusLabel(m.status)}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "var(--color-muted-foreground)", marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Clock size={11} />
                        {format(new Date(m.dateTime), "h:mm a")}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <User2 size={11} />
                        {m.client?.name}
                      </div>
                      {m.project && (
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <FolderKanban size={11} />
                          {m.project.name}
                        </div>
                      )}
                    </div>

                    {m.notes && (
                      <div style={{ fontSize: "12px", color: "var(--color-foreground)", background: "var(--color-muted)", borderRadius: "6px", padding: "8px", marginBottom: "10px", lineHeight: 1.5 }}>
                        {m.notes}
                      </div>
                    )}

                    {reschedulingMeetingId === m.id ? (
                      <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-muted-foreground)" }}>Select New Date & Time</label>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <input
                            type="datetime-local"
                            className="form-input"
                            style={{ fontSize: "12px", padding: "4px 8px" }}
                            value={rescheduleDateTime}
                            onChange={e => setRescheduleDateTime(e.target.value)}
                          />
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => rescheduleMeeting(m.id)}
                            className="btn btn-xs btn-primary"
                            disabled={!rescheduleDateTime}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setReschedulingMeetingId(null)}
                            className="btn btn-xs btn-outline"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    ) : (
                      m.status === "scheduled" && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <button
                            onClick={() => updateStatus(m.id, "completed")}
                            className="btn btn-xs"
                            style={{ background: "#dcfce7", color: "#15803d", border: "none" }}
                          >
                            ✓ Complete
                          </button>
                          <button
                            onClick={() => {
                              setReschedulingMeetingId(m.id);
                              // Convert date to ISO format for input
                              const current = new Date(m.dateTime);
                              const tzoffset = current.getTimezoneOffset() * 60000;
                              const localISOTime = (new Date(current.getTime() - tzoffset)).toISOString().slice(0, 16);
                              setRescheduleDateTime(localISOTime);
                            }}
                            className="btn btn-xs"
                            style={{ background: "#eff6ff", color: "#1e40af", border: "none" }}
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => updateStatus(m.id, "cancelled")}
                            className="btn btn-xs"
                            style={{ background: "#f1f5f9", color: "#64748b", border: "none" }}
                          >
                            Cancel
                          </button>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming list below */}
      <div style={{ marginTop: "20px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>All Meetings This Month</h2>
        <div className="card">
          <div style={{ overflowX: "auto" }}>
            {meetings.length === 0 ? (
              <div className="empty-state">
                <Calendar size={32} color="var(--color-muted-foreground)" />
                <p style={{ marginTop: "12px" }}>No meetings this month</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Meeting</th>
                    <th>Client</th>
                    <th>Project</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 500 }}>{m.title}</td>
                      <td>{m.client?.name}</td>
                      <td style={{ color: "var(--color-muted-foreground)" }}>{m.project?.name ?? "—"}</td>
                      <td style={{ fontSize: "13px" }}>{formatDateTime(m.dateTime)}</td>
                      <td><span className={`badge ${getStatusColor(m.status)}`}>{getStatusLabel(m.status)}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {m.status === "scheduled" && (
                            <>
                              <button onClick={() => updateStatus(m.id, "completed")} className="btn btn-xs" style={{ background: "#dcfce7", color: "#15803d", border: "none" }}>Complete</button>
                              <button onClick={() => updateStatus(m.id, "cancelled")} className="btn btn-xs btn-ghost">Cancel</button>
                            </>
                          )}
                          <button onClick={() => deleteMeeting(m.id)} className="btn btn-xs btn-ghost" style={{ color: "#DC2626" }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <AddMeetingModal
          clients={clients}
          projects={projects}
          onClose={() => setShowModal(false)}
          onCreated={m => { setMeetings(prev => [...prev, m]); setShowModal(false); }}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
