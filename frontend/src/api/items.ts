import { apiRequest } from "./APIWrapper";

// Fetch a single item by ID
export const getItemById = async (id: string) => {
  return apiRequest(`/getItemById/${encodeURIComponent(id)}`, {
    method: "GET",
  });
};

// Add an item
export const addItem = async (data: object) => {
  return apiRequest("/addItem", {
    method: "POST",
    body: data as Record<string, unknown>,
  });
};

// Update an item
export const updateItem = async (id: string, data: object) => {
  return apiRequest(`/updateItem/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: data as Record<string, unknown>,
  });
};

// Delete an item
export const deleteItem = async (id: string) => {
  return apiRequest(`/deleteItem/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};
