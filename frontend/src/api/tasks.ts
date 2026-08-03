import { apiRequest } from "./APIWrapper";

export type Task = {
  id: string;
  type: "auto" | "manual";
  title: string;
  completed: boolean;
  dueDate: string | null;
  createdAt?: unknown;
  itemId?: string;
  sku?: string;
  milestoneMonths?: number;
};

// Fetch all tasks (auto-generated + manual). Read-only — does not generate new auto tasks.
export const getAllTasks = async () => {
  return apiRequest<Task[]>("/api/getAllTasks", { method: "GET" });
};

// Scan in-stock items and create any newly-eligible auto-generated tasks.
// Call once per session (e.g. on sign-in), not on every dashboard visit.
export const generateTasks = async () => {
  return apiRequest<{ generated: boolean }>("/api/generateTasks", { method: "POST" });
};

// Add a manual task
export const addTask = async (data: { title: string; dueDate?: string | null }) => {
  return apiRequest<Task>("/api/addTask", {
    method: "POST",
    body: data as Record<string, unknown>,
  });
};

// Update a task (toggle completed, or edit a manual task's title/dueDate)
export const updateTask = async (
  id: string,
  data: { title?: string; dueDate?: string | null; completed?: boolean }
) => {
  return apiRequest<{ id: string }>(`/api/updateTask/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: data as Record<string, unknown>,
  });
};

// Delete a task
export const deleteTask = async (id: string) => {
  return apiRequest<{ id: string }>(`/api/deleteTask/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};
