import { Sale } from "@/api/sales";

export type DateRange = {
  start: Date;
  end: Date;
};

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
  "grade",
  "woolType",
  "intakePrice",
  "sellingPrice",
  "profit",
  "quantity",
  "breed",
  "color",
  "farmerName",
  "city",
  "state",
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
