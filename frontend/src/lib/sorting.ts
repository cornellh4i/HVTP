export type DateSortDirection = "date-asc" | "date-desc";

export function parseTimestamp(value: unknown): number {
  if (!value) return 0;

  if (typeof value === "object" && value !== null && "_seconds" in value) {
    const seconds = Number((value as { _seconds?: number })._seconds);
    return Number.isFinite(seconds) ? seconds * 1000 : 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const asNumber = Number(value);
    if (Number.isFinite(asNumber) && value.trim() !== "") {
      return asNumber;
    }

    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

export function sortByDate<T>(
  rows: T[],
  direction: DateSortDirection,
  getDate: (row: T) => unknown
): T[] {
  return [...rows].sort((a, b) => {
    const aTime = parseTimestamp(getDate(a));
    const bTime = parseTimestamp(getDate(b));

    return direction === "date-asc" ? aTime - bTime : bTime - aTime;
  });
}
