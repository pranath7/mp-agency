"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  ArrowLeft, Edit2, Plus, Trash2, User, Calendar, IndianRupee,
  CheckCircle2, Clock, AlertCircle, X, Loader2, Building2,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

type Task = {
  id: string; title: string; description?: string; status: string;
  dueDate?: string | null; assignedTo?: { id: string; name: string } | null;
};

type Project = {
  id: string; name: string; description?: string; status: string;
  startDate?: string | null; deadline?: string | null; totalValue: number;
  client: { id: string; name: string; company?: string; email?: string; phone?: string };
  tasks: Task[]; invoices: any[]; expenses: any[];
};

const COLUMNS: { id: string; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "#64748B" },
  { id: "in-progress", label: "In Progress", color: "#D97706" },
  { id: "done", label: "Done", color: "#059669" },
];

function AddTaskModal({
  projectId, users, onClose, onCreated,
}: {
  projectId: string; users: any[]; onClose: () => void; onCreated: (task: Task) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("todo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    setLoading(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc, assignedToId: assignedToId || null, dueDate: dueDate || undefined, status, projectId }),
    });
    if (res.ok) {
      const task = await res.json();
      onCreated(task);
      onClose();
    } else {
      setError("Failed to create task");
    }
    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>Add Task</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "4px" }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {error && <div style={{ color: "#DC2626", fontSize: "13px", marginBottom: "12px" }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional details…" style={{ resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Column</label>
                <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Assign To</label>
              <select className="form-select" value={assignedToId} onChange={e => setAssignedToId(e.target.value)}>
                <option value="">Unassigned</option>
                {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={14} />}
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddInvoiceModal({ projectId, onClose, onCreated }: { projectId: string; onClose: () => void; onCreated: (inv: any) => void }) {
  const [amount, setAmount] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, amount: Number(amount), issueDate, dueDate, notes, status: "pending" }),
    });
    if (res.ok) {
      const inv = await res.json();
      onCreated(inv);
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: "420px" }}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>Add Invoice</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "4px" }}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input className="form-input" type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="50000" required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Issue Date *</label>
                <input className="form-input" type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Notes</label>
              <input className="form-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Advance payment" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={loading || !amount || !dueDate} className="btn btn-primary">
              {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <IndianRupee size={14} />}
              Add Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then(r => r.json()),
      fetch("/api/users").then(r => r.json()).catch(() => []),
    ]).then(([p, u]) => {
      setProject(p);
      setNotes(p.description ?? "");
      setUsers(u ?? []);
      setLoading(false);
    });
  }, [id]);

  const onDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination || !project) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    // Optimistic update
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map(t => t.id === draggableId ? { ...t, status: newStatus } : t),
      };
    });

    // Persist
    await fetch(`/api/tasks/${draggableId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }, [project]);

  const handleTaskCreated = (task: Task) => {
    setProject(prev => prev ? { ...prev, tasks: [...prev.tasks, task] } : prev);
  };

  const handleInvoiceCreated = (inv: any) => {
    setProject(prev => prev ? { ...prev, invoices: [...prev.invoices, inv] } : prev);
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    setProject(prev => prev ? { ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) } : prev);
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
  };

  const markInvoicePaid = async (invId: string) => {
    const res = await fetch(`/api/invoices/${invId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", paidDate: new Date().toISOString() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProject(prev => prev ? {
        ...prev,
        invoices: prev.invoices.map(i => i.id === invId ? updated : i),
      } : prev);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: "32px", width: "200px", marginBottom: "24px" }} />
        <div className="skeleton" style={{ height: "200px", marginBottom: "20px" }} />
        <div className="skeleton" style={{ height: "400px" }} />
      </div>
    );
  }

  if (!project) return <div className="empty-state"><p>Project not found</p></div>;

  const tasksByStatus = (status: string) => project.tasks.filter(t => t.status === status);
  const totalInvoiced = project.invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = project.invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = project.invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "24px" }}>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ marginTop: "2px" }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>{project.name}</h1>
            <span className={`badge ${getStatusColor(project.status)}`}>{getStatusLabel(project.status)}</span>
          </div>
          <div style={{ fontSize: "14px", color: "var(--color-muted-foreground)" }}>
            {project.client.name}{project.client.company ? ` · ${project.client.company}` : ""}
          </div>
        </div>
        <Link href={`/projects/${id}/edit`} className="btn btn-outline btn-sm">
          <Edit2 size={14} /> Edit
        </Link>
      </div>

      {/* Top panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Details */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 600, fontSize: "14px" }}>Project Details</span>
          </div>
          <div className="card-body" style={{ fontSize: "13px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Building2 size={14} color="var(--color-muted-foreground)" />
                <div>
                  <div style={{ color: "var(--color-muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Client</div>
                  <div>{project.client.name}</div>
                  {project.client.email && <div style={{ color: "var(--color-muted-foreground)" }}>{project.client.email}</div>}
                </div>
              </div>
              {project.startDate && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={14} color="var(--color-muted-foreground)" />
                  <div>
                    <div style={{ color: "var(--color-muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Start</div>
                    <div>{formatDate(project.startDate)}</div>
                  </div>
                </div>
              )}
              {project.deadline && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertCircle size={14} color="var(--color-muted-foreground)" />
                  <div>
                    <div style={{ color: "var(--color-muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Deadline</div>
                    <div>{formatDate(project.deadline)}</div>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <IndianRupee size={14} color="var(--color-muted-foreground)" />
                <div>
                  <div style={{ color: "var(--color-muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Total Value</div>
                  <div style={{ fontWeight: 700, fontSize: "15px" }}>{formatCurrency(project.totalValue)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 600, fontSize: "14px" }}>Billing</span>
            <button onClick={() => setShowAddInvoice(true)} className="btn btn-sm btn-outline">
              <Plus size={13} /> Add Invoice
            </button>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
              {[
                { label: "Total Invoiced", value: totalInvoiced, color: "var(--color-foreground)" },
                { label: "Received", value: totalPaid, color: "#059669" },
                { label: "Pending", value: totalPending, color: "#D97706" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-muted-foreground)" }}>{label}</span>
                  <span style={{ fontWeight: 700, fontSize: "14px", color, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(value)}</span>
                </div>
              ))}
            </div>
            <hr className="divider" />
            <div style={{ maxHeight: "140px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
              {project.invoices.map(inv => (
                <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                  <div>
                    <span className={`badge ${getStatusColor(inv.status)}`} style={{ fontSize: "10px" }}>{getStatusLabel(inv.status)}</span>
                    <span style={{ marginLeft: "6px", color: "var(--color-muted-foreground)" }}>Due {formatDate(inv.dueDate)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(inv.amount)}</span>
                    {inv.status !== "paid" && (
                      <button
                        onClick={() => markInvoicePaid(inv.id)}
                        className="btn btn-xs"
                        style={{ background: "#dcfce7", color: "#15803d", border: "none", fontSize: "11px" }}
                        title="Mark as paid"
                      >
                        ✓ Paid
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {project.invoices.length === 0 && (
                <div style={{ color: "var(--color-muted-foreground)", fontSize: "12px", textAlign: "center", padding: "8px" }}>No invoices yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 600, fontSize: "14px" }}>Internal Notes</span>
            {savingNotes && <span style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>Saving…</span>}
          </div>
          <div className="card-body">
            <textarea
              className="form-input"
              rows={8}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add internal notes, context, or updates here…"
              style={{ resize: "none", fontSize: "13px" }}
              onBlur={async () => {
                if (notes === project.description) return;
                setSavingNotes(true);
                await fetch(`/api/projects/${id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ description: notes }),
                });
                setSavingNotes(false);
              }}
            />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: "16px" }}>
          <span style={{ fontWeight: 600, fontSize: "15px" }}>Task Board</span>
          <button onClick={() => setShowAddTask(true)} className="btn btn-primary btn-sm">
            <Plus size={14} /> Add Task
          </button>
        </div>
        <div className="card-body" style={{ paddingTop: 0 }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="kanban-board">
              {COLUMNS.map(col => {
                const tasks = tasksByStatus(col.id);
                return (
                  <Droppable key={col.id} droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="kanban-column"
                        style={{
                          background: snapshot.isDraggingOver
                            ? col.id === "done" ? "#ecfdf5" : col.id === "in-progress" ? "#fffbeb" : "#eff6ff"
                            : "var(--color-muted)",
                          transition: "background 150ms",
                        }}
                      >
                        <div className="kanban-column-header">
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.color }} />
                            <span className="kanban-column-title">{col.label}</span>
                          </div>
                          <span className="kanban-count">{tasks.length}</span>
                        </div>
                        {tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                className={`kanban-card${snap.isDragging ? " kanban-card-dragging" : ""}`}
                              >
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "13px", fontWeight: 500, marginBottom: "6px", lineHeight: 1.4 }}>
                                      {task.title}
                                    </div>
                                    {task.description && (
                                      <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)", marginBottom: "8px", lineHeight: 1.4 }}>
                                        {task.description.slice(0, 80)}{task.description.length > 80 ? "…" : ""}
                                      </div>
                                    )}
                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                      {task.assignedTo && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--color-muted-foreground)" }}>
                                          <User size={11} />
                                          <span>{task.assignedTo.name.split(" ")[0]}</span>
                                        </div>
                                      )}
                                      {task.dueDate && (
                                        <div style={{
                                          display: "flex", alignItems: "center", gap: "4px",
                                          fontSize: "11px",
                                          color: new Date(task.dueDate) < new Date() && task.status !== "done" ? "#DC2626" : "var(--color-muted-foreground)",
                                          fontWeight: new Date(task.dueDate) < new Date() && task.status !== "done" ? 600 : 400,
                                        }}>
                                          <Clock size={11} />
                                          <span>{new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
                                    className="btn btn-ghost btn-xs"
                                    style={{ padding: "2px", opacity: 0.4, flexShrink: 0 }}
                                    title="Delete task"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        <button
                          onClick={() => setShowAddTask(true)}
                          className="btn btn-ghost btn-sm"
                          style={{ width: "100%", justifyContent: "flex-start", color: "var(--color-muted-foreground)", marginTop: "4px" }}
                        >
                          <Plus size={14} /> Add task
                        </button>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      </div>

      {showAddTask && (
        <AddTaskModal
          projectId={id}
          users={users}
          onClose={() => setShowAddTask(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {showAddInvoice && (
        <AddInvoiceModal
          projectId={id}
          onClose={() => setShowAddInvoice(false)}
          onCreated={handleInvoiceCreated}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
