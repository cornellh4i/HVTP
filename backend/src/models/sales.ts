import { Timestamp } from "firebase-admin/firestore";

export interface SaleFields {
  itemId: string;
  weightSold: number;
  weightUnit: "kg" | "lb";
  pricePerWeight: number;
  totalPrice: number;
  soldAt: Timestamp;
  buyerName: string;
  notes: string;
}

export type SaleInsert = SaleFields;
export type SaleUpdate = Partial<SaleFields>;