import { apiRequest } from "./APIWrapper";

export type Sale = {
  id: string;
  itemId: string;
  locationsId: string;
  inventoryId: string;
  weightSold: number;
  weightUnit: "kg" | "lb";
  pricePerWeight: number;
  totalPrice: number;
  costPerWeight: number;
  soldAt: string | { _seconds?: number; seconds?: number };
  buyerName: string;
  itemName?: string;
  sku?: string;
  breed?: string;
  grade?: string;
  color?: string;
  status?: string;
  isPublic?: boolean;
  itemWeight?: number;
  purchasePrice?: number;
  farmerId?: string;
  farmerName?: string;
  farmerCity?: string;
  farmerState?: string;
};

export type SaleInput = Omit<Sale, "id" | "totalPrice">;

export const getAllSales = async () => {
  return apiRequest<Sale[]>("/api/getAllSales", { method: "GET" });
};

export const getSaleById = async (id: string) => {
  return apiRequest<Sale>(`/api/getSaleById/${encodeURIComponent(id)}`, {
    method: "GET",
  });
};

export const getSalesByItemId = async (itemId: string) => {
  return apiRequest<Sale[]>(`/api/getSalesByItemId/${encodeURIComponent(itemId)}`, {
    method: "GET",
  });
};

export const addSale = async (data: SaleInput) => {
  return apiRequest<{ id: string; totalPrice: number }>("/api/addSale", {
    method: "POST",
    body: data as Record<string, unknown>,
  });
};

export const updateSale = async (id: string, data: Partial<SaleInput>) => {
  return apiRequest<{ id: string }>(`/api/updateSale/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: data as Record<string, unknown>,
  });
};

export const deleteSale = async (id: string) => {
  return apiRequest<{ id: string }>(`/api/deleteSale/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};
