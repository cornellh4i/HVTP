import { Timestamp, QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";
import { getDb } from "../config/firebase";
import { SaleFields } from "../models/sales";
import { ItemFields } from "../models/item";
import { toMillis } from "../utils/dates";

const db = getDb();

// Safely coerce any Firestore value to a finite number, defaulting to 0.
function safeNum(v: unknown): number {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

export interface WeeklyBucket {
  label: string;
  grossIncome: number;
  woolCost: number;
  weightSold: number;
  profit: number;
}

export interface DashboardMetrics {
  grossIncome: number;
  profit: number;
  woolCost: number;
  weightOfWoolSold: number;
  inventoryCost: number;
  weeklyData: WeeklyBucket[];
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

/**
 * Compute every dashboard metric for the given (inclusive) date range.
 *
 * This is the single source of truth for the dashboard numbers — the dashboard
 * route handler and any future export endpoint should both call this so the
 * exported data always matches what the graph shows.
 *
 * Relies on `createdAt` / `soldAt` being stored as Firestore Timestamps (see
 * `utils/dates.toTimestamp` on the write path and the backfill migration).
 */
export async function computeDashboardMetrics(start: Date, end: Date): Promise<DashboardMetrics> {
  const startTimestamp = Timestamp.fromDate(start);
  const endTimestamp = Timestamp.fromDate(end);

  // ── Sales (gross income, weight sold) ──────────────────────────────────────
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
  let costOfGoodsSold = 0;

  for (const sale of sales) {
    grossIncome += safeNum(sale.totalPrice);
    weightOfWoolSold += safeNum(sale.weightSold);
    // COGS for a sale = intake price/lb (costPerWeight) × weight actually sold.
    costOfGoodsSold += safeNum(sale.costPerWeight) * safeNum(sale.weightSold);
  }

  // ── Items added in date range (wool cost) ──────────────────────────────────
  const itemsInRangeSnapshot = await db
    .collection("items")
    .where("createdAt", ">=", startTimestamp)
    .where("createdAt", "<=", endTimestamp)
    .get();

  const itemsInRange: ItemFields[] = itemsInRangeSnapshot.docs.map(
    (doc: QueryDocumentSnapshot<DocumentData>) => doc.data() as ItemFields
  );

  // Wool Cost = capital spent acquiring inventory in this period (its own metric,
  // independent of what was sold).
  let woolCost = 0;
  for (const item of itemsInRange) {
    woolCost += safeNum(item.purchasePrice) * safeNum(item.weight);
  }

  // Profit = gross margin on goods actually sold (revenue − COGS), NOT revenue
  // minus inventory acquired this period.
  const profit = grossIncome - costOfGoodsSold;

  // ── All items (inventory cost — total current value regardless of date) ─────
  const allItemsSnapshot = await db.collection("items").get();

  let inventoryCost = 0;
  for (const doc of allItemsSnapshot.docs) {
    const item = doc.data() as ItemFields;
    inventoryCost += safeNum(item.purchasePrice) * safeNum(item.weight);
  }

  // ── Weekly buckets ──────────────────────────────────────────────────────────
  const buckets = getWeekBuckets(start, end);

  const weeklyData: WeeklyBucket[] = buckets.map(({ start: wStart, end: wEnd }) => {
    const wStartMs = Timestamp.fromDate(wStart).toMillis();
    const wEndMs = Timestamp.fromDate(wEnd).toMillis();

    const inBucket = (value: unknown): boolean => {
      const ms = toMillis(value);
      return ms !== null && ms >= wStartMs && ms <= wEndMs;
    };

    const weekGrossIncome = sales
      .filter((s) => inBucket(s.soldAt))
      .reduce((sum, s) => sum + safeNum(s.totalPrice), 0);

    const weekWeightSold = sales
      .filter((s) => inBucket(s.soldAt))
      .reduce((sum, s) => sum + safeNum(s.weightSold), 0);

    // COGS of sales in this week — used for the per-week profit bar.
    const weekCogs = sales
      .filter((s) => inBucket(s.soldAt))
      .reduce((sum, s) => sum + safeNum(s.costPerWeight) * safeNum(s.weightSold), 0);

    const weekWoolCost = itemsInRange
      .filter((i) => inBucket(i.createdAt))
      .reduce((sum, i) => sum + safeNum(i.purchasePrice) * safeNum(i.weight), 0);

    return {
      label: formatBucketLabel(wStart, wEnd),
      grossIncome: weekGrossIncome,
      woolCost: weekWoolCost,
      weightSold: weekWeightSold,
      profit: weekGrossIncome - weekCogs,
    };
  });

  return {
    grossIncome,
    profit,
    woolCost,
    weightOfWoolSold,
    inventoryCost,
    weeklyData,
  };
}
