import { apiRequest } from "./APIWrapper";

export type Sale = {
  itemId: string;
  weightSold: number;
  weightUnit: "kg" | "lb";
  pricePerWeight: number;
  totalPrice: number;
  soldAt: Date | string;
  buyerName: string;
  notes: string;
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
