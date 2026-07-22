export type ContainerSize = "daily" | "weekly" | "monthly" | "yearly";

export const CONTAINER_SIZES: ContainerSize[] = ["daily", "weekly", "monthly", "yearly"];

export const CONTAINER_LABELS: Record<ContainerSize, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const MAX_BARS = 12;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(from: Date, to: Date): number {
  const start = startOfDay(from);
  const end = startOfDay(to);
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

export function countBarsForRange(from: Date, to: Date, size: ContainerSize): number {
  const start = from < to ? from : to;
  const end = from < to ? to : from;

  if (size === "daily") {
    return daysBetween(start, end);
  }

  if (size === "weekly") {
    const cursor = startOfDay(start);
    cursor.setDate(cursor.getDate() - cursor.getDay());
    let count = 0;
    while (cursor <= end) {
      count += 1;
      cursor.setDate(cursor.getDate() + 7);
    }
    return count;
  }

  if (size === "monthly") {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    let count = 0;
    while (cursor <= end) {
      count += 1;
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return count;
  }

  const cursor = new Date(start.getFullYear(), 0, 1);
  let count = 0;
  while (cursor <= end) {
    count += 1;
    cursor.setFullYear(cursor.getFullYear() + 1);
  }
  return count;
}

/**
 * Daily isn't available from the weekly metrics API — only weekly/monthly/yearly
 * can be derived client-side from weekly buckets.
 */
export function isContainerSelectable(from: Date, to: Date, size: ContainerSize): boolean {
  if (size === "daily") return false;
  return countBarsForRange(from, to, size) <= MAX_BARS;
}

/** Bump to the next larger container until bars ≤ 12 (or yearly). Skips daily. */
export function resolveContainerSize(
  from: Date,
  to: Date,
  preferred: ContainerSize
): { size: ContainerSize; changed: boolean; previous: ContainerSize } {
  const startIndex = Math.max(CONTAINER_SIZES.indexOf(preferred), 1);

  for (let i = startIndex; i < CONTAINER_SIZES.length; i += 1) {
    const candidate = CONTAINER_SIZES[i];
    if (isContainerSelectable(from, to, candidate)) {
      return {
        size: candidate,
        changed: candidate !== preferred,
        previous: preferred,
      };
    }
  }

  return { size: "yearly", changed: preferred !== "yearly", previous: preferred };
}

export type BucketMetrics = {
  label: string;
  grossIncome: number;
  woolCost: number;
  weightSold: number;
  profit: number;
};

/** Aggregate weekly API buckets into monthly/yearly for the chart. */
export function aggregateBuckets(
  weeklyData: BucketMetrics[],
  size: ContainerSize
): BucketMetrics[] {
  if (size === "weekly" || size === "daily" || weeklyData.length === 0) {
    return weeklyData;
  }

  const groups = new Map<string, BucketMetrics>();

  for (const bucket of weeklyData) {
    const key = bucketGroupKey(bucket.label, size);
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, {
        label: key,
        grossIncome: bucket.grossIncome,
        woolCost: bucket.woolCost,
        weightSold: bucket.weightSold,
        profit: bucket.profit,
      });
      continue;
    }

    existing.grossIncome += bucket.grossIncome;
    existing.woolCost += bucket.woolCost;
    existing.weightSold += bucket.weightSold;
    existing.profit += bucket.profit;
  }

  return Array.from(groups.values());
}

/** Parse labels like "2/11-2/17" into a month/year grouping key. */
function bucketGroupKey(label: string, size: ContainerSize): string {
  const startPart = label.split("-")[0]?.trim() ?? label;
  const [monthStr, dayStr] = startPart.split("/");
  const month = Number(monthStr);
  const day = Number(dayStr);
  const now = new Date();
  // Labels omit year — approximate with current year (acceptable for dashboard ranges).
  const date = new Date(now.getFullYear(), (month || 1) - 1, day || 1);

  if (size === "monthly") {
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  return String(date.getFullYear());
}

export { MAX_BARS };
