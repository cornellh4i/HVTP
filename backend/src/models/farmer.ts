export interface FarmerFields {
  itemId: string;
  name: string;
  contact: string;
  city: string;
  state: string;
}

export type FarmerInsert = FarmerFields;
export type FarmerUpdate = Partial<FarmerFields>;
