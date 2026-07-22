import { Sale } from "@/api/sales";
import { Item } from "@/api/items";
import {
  InventoryFilterOptions,
  InventoryFilters,
  PublicationState,
  parseItemTimestamp,
} from "@/components/Admin/Inventory/inventory-utils";
import { DateSortDirection } from "@/lib/sorting";

export type DateRange = {
  start: Date;
  end: Date;
};

/** Transactions keep date-only sorting; inventory uses field + direction. */
export type TransactionFilters = {
  sortBy: DateSortDirection;
  grade: string[];
  color: string[];
  breed: string[];
  status: string[];
  publicationState: PublicationState[];
  state: string[];
};

export const defaultTransactionFilters: TransactionFilters = {
  sortBy: "date-desc",
  grade: [],
  color: [],
  breed: [],
  status: [],
  publicationState: [],
  state: [],
};

export function toInventoryFilters(filters: TransactionFilters): InventoryFilters {
  return {
    sortField: null,
    sortDirection: "asc",
    grade: filters.grade,
    color: filters.color,
    breed: filters.breed,
    status: filters.status,
    publicationState: filters.publicationState,
    state: filters.state,
  };
}

export type TabKey = "purchases" | "sales";

export type PurchaseColumnKey =
  | "sku"
  | "grade"
  | "woolType"
  | "intakePrice"
  | "quantity"
  | "breed"
  | "color"
  | "farmerName";

export type ColumnKey =
  | "grade"
  | "woolType"
  | "intakePrice"
  | "sellingPrice"
  | "profit"
  | "quantity"
  | "breed"
  | "color"
  | "farmerName"
  | "city"
  | "state"
  | "sku";

export type FilterKey =
  | "status"
  | "woolType"
  | "breed"
  | "grade"
  | "color"
  | "publicationStatus"
  | "state"
  | "farmerName";

export const purchaseColumnLabels: Record<PurchaseColumnKey, string> = {
  sku: "SKU",
  grade: "Grade",
  woolType: "Wool Type",
  intakePrice: "Intake Price",
  quantity: "Quantity",
  breed: "Breed",
  color: "Color",
  farmerName: "Farmer Name",
};

export const defaultPurchaseColumns: PurchaseColumnKey[] = [
  "grade",
  "woolType",
  "intakePrice",
  "quantity",
  "breed",
  "color",
  "farmerName",
];

export const columnLabels: Record<ColumnKey, string> = {
  grade: "Grade",
  woolType: "Wool Type",
  intakePrice: "Intake Price",
  sellingPrice: "Selling Price",
  profit: "Profit (lot)",
  quantity: "Quantity",
  breed: "Breed",
  color: "Color",
  farmerName: "Farmer Name",
  city: "City",
  state: "State",
  sku: "SKU",
};

export const defaultColumns: ColumnKey[] = [
  "breed",
  "color",
  "city",
  "sellingPrice",
  "sku",
];

export const filterLabels: Record<FilterKey, string> = {
  status: "Status",
  woolType: "Wool Type",
  breed: "Breed",
  grade: "Grade",
  color: "Color",
  publicationStatus: "Publication Status",
  state: "State",
  farmerName: "Farm",
};

export const getItemDate = (item: Item): Date | null => {
  const value = item.createdAt as unknown;

  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "object") {
    const timestamp = value as { _seconds?: number; seconds?: number };
    const seconds = timestamp._seconds ?? timestamp.seconds;

    if (typeof seconds === "number") {
      return new Date(seconds * 1000);
    }
  }

  return null;
};

export const getPurchaseValue = (item: Item, key: PurchaseColumnKey | FilterKey): string => {
  switch (key) {
    case "woolType":
    case "status":
      return item.status ?? "Unknown";
    case "intakePrice":
      return formatCurrency(item.purchasePrice ?? 0);
    case "quantity":
      return formatQuantity(item.weight);
    case "farmerName":
      return item.farmerName ?? "Unknown";
    case "publicationStatus":
      return item.isPublic ? "Public" : "Private";
    default: {
      const value = item[key as keyof Item];
      if (typeof value === "boolean") return value ? "Yes" : "No";
      if (typeof value === "number") return String(value);
      if (typeof value === "string") return value;
      return "Unknown";
    }
  }
};

export const isItemWithinRange = (item: Item, range: DateRange) => {
  const date = getItemDate(item);
  if (!date) return false;

  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const start = new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate()).getTime();
  const end = new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate()).getTime();

  return day >= start && day <= end;
};

export const getSaleDate = (sale: Sale): Date | null => {
  const value = sale.soldAt as unknown;

  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "object") {
    const timestamp = value as { _seconds?: number; seconds?: number };
    const seconds = timestamp._seconds ?? timestamp.seconds;

    if (typeof seconds === "number") {
      return new Date(seconds * 1000);
    }
  }

  return null;
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export const formatQuantity = (value?: number, unit = "lbs") =>
  `${(value ?? 0).toLocaleString("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value ?? 0) ? 0 : 1,
  })} ${unit}`;

export const getSaleValue = (sale: Sale, key: ColumnKey | FilterKey): string => {
  switch (key) {
    case "woolType":
      return sale.itemName ?? "Unknown";
    case "intakePrice":
      return formatCurrency(sale.costPerWeight ?? sale.purchasePrice ?? 0);
    case "sellingPrice":
      return formatCurrency(sale.pricePerWeight ?? 0);
    case "profit":
      return formatCurrency(((sale.pricePerWeight ?? 0) - (sale.costPerWeight ?? 0)) * (sale.weightSold ?? 0));
    case "quantity":
      return formatQuantity(sale.weightSold, sale.weightUnit === "kg" ? "kg" : "lbs");
    case "publicationStatus":
      return sale.isPublic ? "Public" : "Private";
    case "farmerName":
      return sale.farmerName ?? "Unknown";
    case "city":
      return sale.farmerCity ?? "Unknown";
    case "state":
      return sale.farmerState ?? "Unknown";
    default: {
      const value = sale[key as keyof Sale];
      if (typeof value === "boolean") return value ? "Yes" : "No";
      if (typeof value === "number") return String(value);
      if (typeof value === "string") return value;
      return "Unknown";
    }
  }
};

export const isWithinRange = (sale: Sale, range: DateRange) => {
  const date = getSaleDate(sale);
  if (!date) return false;

  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const start = new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate()).getTime();
  const end = new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate()).getTime();

  return day >= start && day <= end;
};

export const formatRange = (range: DateRange) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(range.start)} - ${formatter.format(range.end)}`;
};

/* ── Adapters so the shared Inventory Filter can drive the Sales tab ─────── */

const normalizeValue = (value: string | undefined | null) => value?.trim() ?? "";

const uniqueSorted = (values: Array<string | undefined | null>) =>
  Array.from(new Set(values.map(normalizeValue).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );

const getSalePublicationState = (sale: Sale): PublicationState =>
  sale.isPublic ? "published" : "unpublished";

// The shared Filter component is typed around Item fields. Sales only carry a
// subset of those (wool type via itemName, farmer state, publication state),
// so grade/color/breed simply resolve to empty option lists.
export const getSalesFilterOptions = (sales: Sale[]): InventoryFilterOptions => ({
  grade: [],
  color: [],
  breed: [],
  status: uniqueSorted(sales.map((sale) => sale.itemName)),
  publicationState: ["published", "unpublished"],
  state: uniqueSorted(sales.map((sale) => sale.farmerState)),
});

export const filterSales = (sales: Sale[], filters: TransactionFilters): Sale[] =>
  [...sales]
    .filter((sale) => {
      const matchesStatus =
        filters.status.length === 0 || filters.status.includes(normalizeValue(sale.itemName));
      const matchesPublication =
        filters.publicationState.length === 0 ||
        filters.publicationState.includes(getSalePublicationState(sale));
      const matchesState =
        filters.state.length === 0 || filters.state.includes(normalizeValue(sale.farmerState));

      return matchesStatus && matchesPublication && matchesState;
    })
    .sort((a, b) => {
      const aTime = getSaleDate(a)?.getTime() ?? 0;
      const bTime = getSaleDate(b)?.getTime() ?? 0;

      return filters.sortBy === "date-asc" ? aTime - bTime : bTime - aTime;
    });

// Item sort mirrors date ordering without re-running the inventory filter pass
// (date-range + shared filters are applied separately).
export const sortItemsByDate = (items: Item[], sortBy: DateSortDirection): Item[] =>
  [...items].sort((a, b) => {
    const aTime = parseItemTimestamp(a.createdAt);
    const bTime = parseItemTimestamp(b.createdAt);

    return sortBy === "date-asc" ? aTime - bTime : bTime - aTime;
  });
