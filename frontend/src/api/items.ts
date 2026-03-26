import { apiRequest } from "./APIWrapper";

export type Item = {
  id: string;
  sku: string;
  breed?: string;
  grade?: string;
  color?: string;
  weight?: number | string;
  palletNumber?: string;
  status?: string;
  notes?: string;
  farmerName?: string;
  farmerContact?: string;
  farmerCity?: string;
  farmerState?: string;
  purchasePrice?: number | string;
  shearDate?: string;
  image?: string;
  imageUrl?: string;
};

// Fetch all users
export const getAllItems = async () => {
  return apiRequest<Item[]>("/getAllItems", { method: "GET" });
};

// Fetch a single item by ID
export const getItemById = async (id: string) => {
  return apiRequest<Item>(`/api/middleware/getItemById/${encodeURIComponent(id)}`, {
    method: "GET",
  });
};

// Add an item
export const addItem = async (data: object) => {
  return apiRequest<Item>("/addItem", {
    method: "POST",
    body: data as Record<string, unknown>,
  });
};

// Update an item
export const updateItem = async (id: string, data: object) => {
  return apiRequest<Item>(`/updateItem/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: data as Record<string, unknown>,
  });
};

// Delete an item
export const deleteItem = async (id: string) => {
  return apiRequest<void>(`/deleteItem/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};
