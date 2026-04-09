import { apiRequest } from "./APIWrapper";

export type Item = {
  // Core fields (matches backend model)
  id: string;
  farmerId: string;
  name: string;
  sku: string;
  breed?: string;
  grade?: string;
  color?: string;
  weight?: number;
  status?: string;
  images?: string[];
  coverImage?: string;
  qrCode?: string;
  isActive?: boolean;
  isPublic?: boolean;
  notes?: string;
  createdAt?: string;
  // Denormalized from farmer (joined on frontend)
  farmerName?: string;
  farmerContact?: string;
  farmerCity?: string;
  farmerState?: string;
  // UI fields (not yet in backend model)
  location?: string;
  purchasePrice?: number;
  shearDate?: string;
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
// Fuunction Here

// Fetch all publicly visible items (no auth required)
// Function Here

