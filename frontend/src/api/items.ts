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
  images?: string[];
  coverImage?: string;
  imageUrl?: string;
  isPublic?: boolean;
};

// Fetch all users
export const getAllItems = async () => {
  return apiRequest<Item[]>("/api/getAllItems", { method: "GET" });
};

// Fetch a single item by ID
export const getItemById = async (id: string) => {
  return apiRequest<Item>(`/api/getItemById/${encodeURIComponent(id)}`, {
    method: "GET",
  });
};

// Add an item
export const addItem = async (data: object) => {
  return apiRequest<Item>("/api/addItem", {
    method: "POST",
    body: data as Record<string, unknown>,
  });
};

// Update an item
export const updateItem = async (id: string, data: object) => {
  return apiRequest<Item>(`/api/updateItem/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: data as Record<string, unknown>,
  });
};

// Delete an item
export const deleteItem = async (id: string) => {
  return apiRequest<void>(`/api/deleteItem/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};

// Toggle public visibility of an item (admin only)
export const togglePublish = async (id: string) => {
  return apiRequest<Item>(`/api/togglePublish/${encodeURIComponent(id)}`, {
    method: "PATCH",
  });
};

// Fetch all publicly visible items (no auth required)
export const getPublicItems = async () => {
  return apiRequest<Item[]>("/api/public/items", { method: "GET", token: null });
};