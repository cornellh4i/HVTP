export interface InventoryFields {
    itemId: number;
    locationsId: number;
    quantity: number;
    isActive: boolean;
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
}