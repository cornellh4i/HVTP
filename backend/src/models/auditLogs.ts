export interface AuditLogFields {
  itemId: number;
  locationsId: number;
  inventoryId: number;
  previousQty: number;
  changeAmt: number;
  actionType: string;
  newQty: number;
  image: string;
}

export type AuditLogInsert = AuditLogFields;
export type AuditLogUpdate = Partial<AuditLogFields>;
