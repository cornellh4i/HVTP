import { apiRequest } from "./APIWrapper";

export type Sale = {
  id: string;
  itemId: string;
  weightSold: number;
  weightUnit: "kg" | "lb";
  pricePerWeight: number;
  totalPrice: number;
  costPerWeight: number;
  soldAt: string;
  buyerName?: string;
  notes: string;
  itemName?: string;
  itemWeight?: number;
  purchasePrice?: number;
  isPublic?: boolean;
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

// Write getSalesByItemId here


export const addSale = async (data: SaleInput) => {
  return apiRequest<{ id: string; totalPrice: number }>("/api/addSale", {
    method: "POST",
    body: data as Record<string, unknown>,
  });
};

export const updateSale = async (id: string, data: Partial<SaleInput>) => {
  return apiRequest<{ id: string }>(
    `/api/updateSale/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: data as Record<string, unknown>,
    },
  );
};

export const deleteSale = async (id: string) => {
  return apiRequest<{ id: string }>(
    `/api/deleteSale/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
};
