export interface ItemFields {
  id?: string;
  name: string;
  category: string;
  description: string;
  image: string;
  sku: string;
  qrcode: string;
  isActive: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

export type ItemInsert = ItemFields;
export type ItemUpdate = Partial<ItemFields>;
