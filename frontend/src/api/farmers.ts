import { apiRequest } from "./APIWrapper";

// Fetch a single farmer by ID
export const getFarmerById = async (id: string) => {
  return apiRequest(`/getFarmerById/${encodeURIComponent(id)}`, {
    method: "GET",
  });
};
