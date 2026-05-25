import { Request, Response } from "express";
import { getDb } from "../config/firebase";
import { Timestamp, QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";
import { SaleFields } from "../models/sales";
import { ItemFields } from "../models/item";

const db = getDb();

// Safely coerce any Firestore value to a finite number, defaulting to 0.
function safeNum(v: unknown): number {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

interface WeeklyBucket {
  label: string;
  grossIncome: number;
  woolCost: number;
  weightSold: number;
  profit: number;
}

function getWeekBuckets(startDate: Date, endDate: Date): { start: Date; end: Date }[] {
  const buckets: { start: Date; end: Date }[] = [];

  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - cursor.getDay());

  while (cursor <= endDate) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    buckets.push({ start: weekStart, end: weekEnd });
    cursor.setDate(cursor.getDate() + 7);
  }

  return buckets;
}

function formatBucketLabel(start: Date, end: Date): string {
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(start)}-${fmt(end)}`;
}

export async function getDashboardMetrics(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ success: false, error: "startDate and endDate query params are required" });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ success: false, error: "Invalid date format. Use ISO 8601 (e.g. 2026-02-11)" });
      return;
    }

    if (start > end) {
      res.status(400).json({ success: false, error: "startDate must be before or equal to endDate" });
      return;
    }

    const startTimestamp = Timestamp.fromDate(start);
    const endTimestamp = Timestamp.fromDate(end);

    // ── Sales (gross income, weight sold) ────────────────────────────────────
    const salesSnapshot = await db
      .collection("sales")
      .where("soldAt", ">=", startTimestamp)
      .where("soldAt", "<=", endTimestamp)
      .get();

    const sales: SaleFields[] = salesSnapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => doc.data() as SaleFields
    );

    let grossIncome = 0;
    let weightOfWoolSold = 0;

    for (const sale of sales) {
      grossIncome += safeNum(sale.totalPrice);
      weightOfWoolSold += safeNum(sale.weightSold);
    }

    // ── Items added in date range (wool cost) ─────────────────────────────────
    const itemsInRangeSnapshot = await db
      .collection("items")
      .where("createdAt", ">=", startTimestamp)
      .where("createdAt", "<=", endTimestamp)
      .get();

    const itemsInRange: ItemFields[] = itemsInRangeSnapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => doc.data() as ItemFields
    );

    let woolCost = 0;
    for (const item of itemsInRange) {
      woolCost += safeNum(item.purchasePrice) * safeNum(item.weight);
    }

    const profit = grossIncome - woolCost;

    // ── All items (inventory cost — total current value regardless of date) ───
    const allItemsSnapshot = await db.collection("items").get();

    let inventoryCost = 0;
    for (const doc of allItemsSnapshot.docs) {
      const item = doc.data() as ItemFields;
      inventoryCost += safeNum(item.purchasePrice) * safeNum(item.weight);
    }

    // ── Weekly buckets ────────────────────────────────────────────────────────
    const buckets = getWeekBuckets(start, end);

    const weeklyData: WeeklyBucket[] = buckets.map(({ start: wStart, end: wEnd }) => {
      const wStartMs = Timestamp.fromDate(wStart).toMillis();
      const wEndMs   = Timestamp.fromDate(wEnd).toMillis();

      const weekGrossIncome = sales
        .filter((s) => s.soldAt.toMillis() >= wStartMs && s.soldAt.toMillis() <= wEndMs)
        .reduce((sum, s) => sum + safeNum(s.totalPrice), 0);

      const weekWeightSold = sales
        .filter((s) => s.soldAt.toMillis() >= wStartMs && s.soldAt.toMillis() <= wEndMs)
        .reduce((sum, s) => sum + safeNum(s.weightSold), 0);

      const weekWoolCost = itemsInRange
        .filter((i) => i.createdAt.toMillis() >= wStartMs && i.createdAt.toMillis() <= wEndMs)
        .reduce((sum, i) => sum + safeNum(i.purchasePrice) * safeNum(i.weight), 0);

      return {
        label: formatBucketLabel(wStart, wEnd),
        grossIncome: weekGrossIncome,
        woolCost: weekWoolCost,
        weightSold: weekWeightSold,
        profit: weekGrossIncome - weekWoolCost,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        grossIncome,
        profit,
        woolCost,
        weightOfWoolSold,
        inventoryCost,
        weeklyData,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
