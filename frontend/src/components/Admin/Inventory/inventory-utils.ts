import { Item } from "@/api/items";
import {
  SortDirection,
  SortValueKind,
  parseTimestamp,
  sortByField,
  sortByGradeOrder,
} from "@/lib/sorting";

export type InventorySortField =
  | "shearDate"
  | "updatedAt"
  | "quantity"
  | "grade"
  | "type";

export type { SortDirection };

export type PublicationState = "published" | "unpublished";

export type InventoryFilters = {
  sortField: InventorySortField | null;
  sortDirection: SortDirection;
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
  sortField: null,
  sortDirection: "asc",
  grade: [],
  color: [],
  breed: [],
  status: [],
  publicationState: [],
  state: [],
};

export const INVENTORY_SORT_OPTIONS: Array<{
  value: InventorySortField;
  label: string;
}> = [
  { value: "shearDate", label: "Shear Date" },
  { value: "updatedAt", label: "Updated Date" },
  { value: "quantity", label: "Quantity" },
  { value: "grade", label: "Grade" },
  { value: "type", label: "Type" },
];

const ARROW_SORT_FIELDS: ReadonlySet<InventorySortField> = new Set([
  "shearDate",
  "updatedAt",
  "quantity",
]);

export function isArrowSortField(field: InventorySortField): boolean {
  return ARROW_SORT_FIELDS.has(field);
}

export function defaultDirectionForSortField(
  field: InventorySortField
): SortDirection {
  return isArrowSortField(field) ? "desc" : "asc";
}

function normalizeValue(value: string | undefined | null) {
  return value?.trim() ?? "";
}

function uniqueSorted(values: Array<string | undefined | null>) {
  return Array.from(
    new Set(values.map(normalizeValue).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
}

export const parseItemTimestamp = parseTimestamp;

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

function getSortValue(item: Item, field: InventorySortField): unknown {
  switch (field) {
    case "shearDate":
      return item.shearDate;
    case "updatedAt":
      return item.updatedAt ?? item.createdAt;
    case "quantity":
      return item.weight;
    case "grade":
      return item.grade;
    case "type":
      return item.type;
  }
}

function getSortKind(field: InventorySortField): SortValueKind {
  switch (field) {
    case "shearDate":
    case "updatedAt":
      return "date";
    case "quantity":
      return "number";
    case "grade":
    case "type":
      return "string";
  }
}

export function filterInventoryItems(
  items: Item[],
  searchQuery: string,
  filters: InventoryFilters
) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filtered = items.filter((item) => {
    const matchesSearch =
      !normalizedSearch ||
      item.sku?.toLowerCase().includes(normalizedSearch) ||
      item.breed?.toLowerCase().includes(normalizedSearch) ||
      item.grade?.toLowerCase().includes(normalizedSearch) ||
      item.color?.toLowerCase().includes(normalizedSearch) ||
      item.status?.toLowerCase().includes(normalizedSearch) ||
      item.farmerState?.toLowerCase().includes(normalizedSearch);

    const matchesGrade =
      filters.grade.length === 0 ||
      filters.grade.includes(normalizeValue(item.grade));
    const matchesColor =
      filters.color.length === 0 ||
      filters.color.includes(normalizeValue(item.color));
    const matchesBreed =
      filters.breed.length === 0 ||
      filters.breed.includes(normalizeValue(item.breed));
    const matchesStatus =
      filters.status.length === 0 ||
      filters.status.includes(normalizeValue(item.status));
    const matchesPublication =
      filters.publicationState.length === 0 ||
      filters.publicationState.includes(getPublicationState(item));
    const matchesState =
      filters.state.length === 0 ||
      filters.state.includes(normalizeValue(item.farmerState));

    return (
      matchesSearch &&
      matchesGrade &&
      matchesColor &&
      matchesBreed &&
      matchesStatus &&
      matchesPublication &&
      matchesState
    );
  });

  if (!filters.sortField) {
    return sortByGradeOrder(filtered, (item) => item.grade);
  }

  return sortByField(
    filtered,
    filters.sortDirection,
    (item) => getSortValue(item, filters.sortField!),
    { kind: getSortKind(filters.sortField) }
  );
}
