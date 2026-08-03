export interface TaskFields {
  type: "auto" | "manual";
  title: string;
  completed: boolean;
  dismissed: boolean;
  dueDate: string | null;
  createdAt: FirebaseFirestore.Timestamp;
  itemId?: string;
  sku?: string;
  milestoneMonths?: number;
}

export type TaskInsert = TaskFields;
export type TaskUpdate = Partial<Pick<TaskFields, "title" | "dueDate" | "completed">>;
