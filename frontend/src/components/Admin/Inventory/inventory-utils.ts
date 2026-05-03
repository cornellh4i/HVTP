import { Item } from "@/api/items";

export type InventorySort = "date-desc" | "date-asc";
export type PublicationState = "published" | "unpublished";

export type InventoryFilters = {
  sortBy: InventorySort;
  grade: string[];
  color: string[];
  breed: string[];
  status: string[];
  publicationState: PublicationState[];
  state: string[];
};

export type InventoryFilterOptions = {
  grade: string[];
  color: string[];
  breed: string[];
  status: string[];
  publicationState: PublicationState[];
  state: string[];
};

export const defaultInventoryFilters: InventoryFilters = {
  sortBy: "date-desc",
  grade: [],
  color: [],
  breed: [],
  status: [],
  publicationState: [],
  state: [],
};

function normalizeValue(value: string | undefined | null) {
  return value?.trim() ?? "";
}

function uniqueSorted(values: Array<string | undefined | null>) {
  return Array.from(
    new Set(values.map(normalizeValue).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
}

export function parseItemTimestamp(createdAt: unknown): number {
  if (!createdAt) return 0;

  if (typeof createdAt === "object" && createdAt !== null && "_seconds" in createdAt) {
    const seconds = Number((createdAt as { _seconds?: number })._seconds);
    return Number.isFinite(seconds) ? seconds * 1000 : 0;
  }

  if (typeof createdAt === "number") {
    return Number.isFinite(createdAt) ? createdAt : 0;
  }

  if (typeof createdAt === "string") {
    const asNumber = Number(createdAt);
    if (Number.isFinite(asNumber) && createdAt.trim() !== "") {
      return asNumber;
    }

    const parsed = Date.parse(createdAt);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

export function formatItemDate(createdAt: unknown): string | undefined {
  const timestamp = parseItemTimestamp(createdAt);
  if (!timestamp) return undefined;

  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? undefined
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

export function getPublicationState(item: Item): PublicationState {
  return item.isPublic ? "published" : "unpublished";
}

export function getInventoryFilterOptions(items: Item[]): InventoryFilterOptions {
  return {
    grade: uniqueSorted(items.map((item) => item.grade)),
    color: uniqueSorted(items.map((item) => item.color)),
    breed: uniqueSorted(items.map((item) => item.breed)),
    status: uniqueSorted(items.map((item) => item.status)),
    publicationState: ["published", "unpublished"],
    state: uniqueSorted(items.map((item) => item.farmerState)),
  };
}

export function filterInventoryItems(items: Item[], searchQuery: string, filters: InventoryFilters) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return [...items]
    .filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.sku?.toLowerCase().includes(normalizedSearch) ||
        item.breed?.toLowerCase().includes(normalizedSearch) ||
        item.grade?.toLowerCase().includes(normalizedSearch) ||
        item.color?.toLowerCase().includes(normalizedSearch) ||
        item.status?.toLowerCase().includes(normalizedSearch) ||
        item.farmerState?.toLowerCase().includes(normalizedSearch);

      const matchesGrade = filters.grade.length === 0 || filters.grade.includes(normalizeValue(item.grade));
      const matchesColor = filters.color.length === 0 || filters.color.includes(normalizeValue(item.color));
      const matchesBreed = filters.breed.length === 0 || filters.breed.includes(normalizeValue(item.breed));
      const matchesStatus = filters.status.length === 0 || filters.status.includes(normalizeValue(item.status));
      const matchesPublication =
        filters.publicationState.length === 0 ||
        filters.publicationState.includes(getPublicationState(item));
      const matchesState = filters.state.length === 0 || filters.state.includes(normalizeValue(item.farmerState));

      return (
        matchesSearch &&
        matchesGrade &&
        matchesColor &&
        matchesBreed &&
        matchesStatus &&
        matchesPublication &&
        matchesState
      );
    })
    .sort((a, b) => {
      const aTime = parseItemTimestamp(a.createdAt);
      const bTime = parseItemTimestamp(b.createdAt);

      return filters.sortBy === "date-asc" ? aTime - bTime : bTime - aTime;
    });
}
