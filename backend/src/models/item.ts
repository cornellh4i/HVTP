export interface ItemFields {
  farmerId: string;
  name: string;
  farmerId: string;
  sku: string;
  breed: string;
  grade: string;
  color: string;
  weight: number;
  status: string;
  images: string[];
  coverImage: string;
  qrCode: string;
  isActive: boolean;
  isPublic: boolean;
  notes: string;
  palletLocation: string;
  shearDate: string;
  purchasePrice: number;
  createdAt: FirebaseFirestore.Timestamp;
}

export type ItemInsert = ItemFields;
export type ItemUpdate = Partial<ItemFields>;
