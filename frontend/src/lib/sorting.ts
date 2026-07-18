export type DateSortDirection = "date-asc" | "date-desc";
export type SortDirection = "asc" | "desc";

export const GRADE_ORDER = ["Fine", "Long", "Medium", "Rug"] as const;

export type SortValueKind = "date" | "number" | "string";

export type SortByFieldOptions = {
  kind: SortValueKind;
  /** When kind is "string", optional fixed order (e.g. grade). Unknown values sort after. */
  order?: readonly string[];
};

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

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toStringValue(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function orderedIndex(value: string, order: readonly string[]): number {
  const index = order.findIndex(
    (entry) => entry.toLowerCase() === value.toLowerCase()
  );
  return index === -1 ? order.length : index;
}

function compareValues(
  a: unknown,
  b: unknown,
  options: SortByFieldOptions
): number {
  if (options.kind === "date") {
    return parseTimestamp(a) - parseTimestamp(b);
  }

  if (options.kind === "number") {
    return toNumber(a) - toNumber(b);
  }

  const aStr = toStringValue(a);
  const bStr = toStringValue(b);

  if (options.order) {
    const aIndex = orderedIndex(aStr, options.order);
    const bIndex = orderedIndex(bStr, options.order);
    if (aIndex !== bIndex) return aIndex - bIndex;
  }

  return aStr.localeCompare(bStr, undefined, { sensitivity: "base" });
}

export function sortByDate<T>(
  rows: T[],
  direction: DateSortDirection,
  getDate: (row: T) => unknown
): T[] {
  return sortByField(
    rows,
    direction === "date-asc" ? "asc" : "desc",
    getDate,
    { kind: "date" }
  );
}

export function sortByField<T>(
  rows: T[],
  direction: SortDirection,
  getValue: (row: T) => unknown,
  options: SortByFieldOptions
): T[] {
  return [...rows].sort((a, b) => {
    const comparison = compareValues(getValue(a), getValue(b), options);
    return direction === "asc" ? comparison : -comparison;
  });
}

export function sortByGradeOrder<T>(
  rows: T[],
  getGrade: (row: T) => unknown
): T[] {
  return sortByField(rows, "asc", getGrade, {
    kind: "string",
    order: GRADE_ORDER,
  });
}
