import { Request, Response } from "express";
import { Timestamp } from "firebase-admin/firestore";
import { TaskFields, TaskInsert, TaskUpdate } from "../models/tasks";
import { ItemFields } from "../models/item";
import { getDb } from "../config/firebase";
import { successJson, errorJson } from "../utils/jsonResponses";
import { toMillis } from "../utils/dates";

const db = getDb();

const AVG_MONTH_MS = 2629800000; // ~30.4368 days
const MILESTONE_STEP_MONTHS = 3;

async function getInStockItemIds(): Promise<Set<string>> {
  const itemsSnapshot = await db
    .collection("items")
    .where("remainingWeight", ">", 0)
    .get();

  return new Set(itemsSnapshot.docs.map((doc) => doc.id));
}

async function generateAutoTasks(): Promise<void> {
  const itemsSnapshot = await db
    .collection("items")
    .where("remainingWeight", ">", 0)
    .get();

  for (const doc of itemsSnapshot.docs) {
    const item = doc.data() as ItemFields;

    const shearMs = toMillis(item.shearDate);
    if (shearMs === null) continue;

    const elapsedMs = Date.now() - shearMs;
    if (elapsedMs < 0) continue;

    const monthsElapsed = Math.floor(elapsedMs / AVG_MONTH_MS);
    const maxMilestone =
      Math.floor(monthsElapsed / MILESTONE_STEP_MONTHS) * MILESTONE_STEP_MONTHS;

    for (
      let milestone = MILESTONE_STEP_MONTHS;
      milestone <= maxMilestone;
      milestone += MILESTONE_STEP_MONTHS
    ) {
      const taskId = `auto_${doc.id}_${milestone}`;
      const taskRef = db.collection("tasks").doc(taskId);
      const existing = await taskRef.get();
      if (existing.exists) continue;

      const newTask: TaskInsert = {
        type: "auto",
        title: `Lot ${item.sku} has reached ${milestone} months since shear date`,
        completed: false,
        dismissed: false,
        dueDate: null,
        createdAt: Timestamp.now(),
        itemId: doc.id,
        sku: item.sku,
        milestoneMonths: milestone,
      };
      await taskRef.set(newTask);
    }
  }
}

export const generateTasks = async (_req: Request, res: Response) => {
  try {
    await generateAutoTasks();
    res.status(200).json(successJson({ generated: true }));
  } catch (err) {
    console.error("generateTasks failed:", err);
    res.status(500).json(errorJson("Error generating tasks"));
  }
};

export const getAllTasks = async (_req: Request, res: Response) => {
  try {
    const inStockItemIds = await getInStockItemIds();

    const snapshot = await db.collection("tasks").get();
    const tasks = snapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as TaskFields) }))
      .filter((task) => !task.dismissed)
      .filter(
        (task) =>
          task.type === "manual" ||
          (task.itemId !== undefined && inStockItemIds.has(task.itemId))
      );

    res.status(200).json(successJson(tasks));
  } catch (err) {
    console.error("getAllTasks failed:", err);
    res.status(500).json(errorJson("Error fetching tasks"));
  }
};

export const addTask = async (
  req: Request<{}, {}, { title?: string; dueDate?: string | null }>,
  res: Response
) => {
  try {
    const { title, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json(errorJson("Missing required field: title"));
    }

    const newTask: TaskInsert = {
      type: "manual",
      title: title.trim(),
      completed: false,
      dismissed: false,
      dueDate: dueDate ?? null,
      createdAt: Timestamp.now(),
    };

    const ref = await db.collection("tasks").add(newTask);
    res.status(201).json(successJson({ id: ref.id, ...newTask }));
  } catch {
    res.status(500).json(errorJson("Error creating task"));
  }
};

export const updateTask = async (
  req: Request<{ id: string }, {}, TaskUpdate>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const doc = await db.collection("tasks").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json(errorJson("Task not found"));
    }

    const existing = doc.data() as TaskFields;
    if (
      existing.type === "auto" &&
      (updates.title !== undefined || updates.dueDate !== undefined)
    ) {
      return res
        .status(400)
        .json(errorJson("Cannot edit auto-generated task fields"));
    }

    await doc.ref.update(updates);
    res.status(200).json(successJson({ id }));
  } catch {
    res.status(500).json(errorJson("Error updating task"));
  }
};

export const deleteTask = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("tasks").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json(errorJson("Task not found"));
    }

    const existing = doc.data() as TaskFields;
    if (existing.type === "auto") {
      // Soft-delete: the doc must keep existing so generateAutoTasks' existence
      // check doesn't recreate this exact milestone on the next fetch.
      await doc.ref.update({ dismissed: true });
    } else {
      await doc.ref.delete();
    }

    res.status(200).json(successJson({ id }));
  } catch {
    res.status(500).json(errorJson("Error deleting task"));
  }
};
