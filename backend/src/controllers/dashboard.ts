import { Request, Response } from "express";
import db from "../config/firebase";
import { Timestamp, QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";
import { SaleFields } from "../models/sales";

interface WeeklyBucket {
  label: string;
  grossIncome: number;
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

    const snapshot = await db.firestore()
      .collection("sales")
      .where("soldAt", ">=", startTimestamp)
      .where("soldAt", "<=", endTimestamp)
      .get();

    const sales: SaleFields[] = snapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => doc.data() as SaleFields
    );

    let grossIncome = 0;
    let totalCost = 0;
    let weightOfWoolSold = 0;

    for (const sale of sales) {
      const cost = sale.costPerWeight * sale.weightSold;
      grossIncome += sale.totalPrice;
      totalCost += cost;
      weightOfWoolSold += sale.weightSold;
    }

    const profit = grossIncome - totalCost;

    const buckets = getWeekBuckets(start, end);

    const weeklyData: WeeklyBucket[] = buckets.map(({ start: wStart, end: wEnd }) => {
      const wStartTs = Timestamp.fromDate(wStart);
      const wEndTs = Timestamp.fromDate(wEnd);

      const bucketGrossIncome = sales
        .filter((s) => s.soldAt >= wStartTs && s.soldAt <= wEndTs)
        .reduce((sum, s) => sum + s.totalPrice, 0);

      return {
        label: formatBucketLabel(wStart, wEnd),
        grossIncome: bucketGrossIncome,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        grossIncome,
        profit,
        totalCost,
        weightOfWoolSold,
        weeklyData,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}