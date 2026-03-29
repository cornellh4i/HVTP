export interface ItemFields {
  name: string;
  sku: string;
  breed: string;
  grade: string;
  color: string;
  weight: number;
  status: string;
  image: string;
  qrCode: string;
  isActive: boolean;
  isPublic: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

export type ItemInsert = ItemFields;
export type ItemUpdate = Partial<ItemFields>;
