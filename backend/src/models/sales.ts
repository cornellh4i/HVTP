import { Timestamp } from "firebase-admin/firestore";

export interface SaleFields {
  itemId: string;
  weightSold: number;
  weightUnit: "kg" | "lb";
  pricePerWeight: number;
  totalPrice: number;
  costPerWeight: number;
  soldAt: Timestamp;
  buyerName: string;
  buyerPhone?: string;
  buyerEmail?: string;
  buyerAddress?: string;
  notes: string;
}

export type SaleInsert = SaleFields;
export type SaleUpdate = Partial<SaleFields>;