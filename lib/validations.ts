import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  clientId: z.string().min(1, "Client is required"),
  description: z.string().optional(),
  status: z.enum(["active", "completed", "on-hold"]).default("active"),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
  totalValue: z.coerce.number().min(0, "Value must be positive").default(0),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "done"]).default("todo"),
  assignedToId: z.string().optional().nullable(),
  dueDate: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
});

export const meetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  clientId: z.string().min(1, "Client is required"),
  projectId: z.string().optional().nullable(),
  dateTime: z.string().min(1, "Date and time is required"),
  notes: z.string().optional(),
  status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
});

export const invoiceSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  status: z.enum(["pending", "paid", "overdue"]).default("pending"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  paidDate: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type MeetingInput = z.infer<typeof meetingSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
