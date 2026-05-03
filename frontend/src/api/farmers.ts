import { apiRequest } from "./APIWrapper";
 
export interface FarmerFields {
  name: string;
  city: string;
  state: string;
}
 
export type FarmerInsert = FarmerFields;
export type FarmerUpdate = Partial<FarmerFields>;
 
export type Farmer = FarmerFields & { id: string };

export const addFarmer = async (data: FarmerInsert): Promise<Farmer> => {
  return apiRequest<Farmer>("/api/addFarmer", {
    method: "POST",
    body: data as unknown as Record<string, unknown>,
  });
};

// Fetch a single farmer by ID
// export const getFarmerById = async (id: string) => {
//   return apiRequest(`/api/getFarmerById/${encodeURIComponent(id)}`, {
//     method: "GET",
//   });
// };
