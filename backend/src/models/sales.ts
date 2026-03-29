import { Timestamp } from "firebase-admin/firestore";

export interface SaleFields {
  itemId: string;
  locationsId: string;
  inventoryId: string;
  weightSold: number;
  weightUnit: "kg" | "lb";
  pricePerWeight: number;
  totalPrice: number;
  costPerWeight: number;
  soldAt: Timestamp;
  buyerName: string;
}

export type SaleInsert = SaleFields;
export type SaleUpdate = Partial<SaleFields>;
