import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    // Project
    active: "status-active",
    completed: "status-done",
    "on-hold": "status-hold",
    // Task
    todo: "status-todo",
    "in-progress": "status-progress",
    done: "status-done",
    // Invoice
    pending: "status-pending",
    paid: "status-done",
    overdue: "status-overdue",
    // Meeting
    scheduled: "status-active",
    cancelled: "status-hold",
  };
  return map[status] ?? "status-default";
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    active: "Active",
    completed: "Completed",
    "on-hold": "On Hold",
    todo: "To Do",
    "in-progress": "In Progress",
    done: "Done",
    pending: "Pending",
    paid: "Paid",
    overdue: "Overdue",
    scheduled: "Scheduled",
    cancelled: "Cancelled",
  };
  return map[status] ?? status;
}

export function getDaysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
