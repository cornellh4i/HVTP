export interface LocationFields {
    name: string;
    section: string;
    isActive: boolean;
    createdAt: FirebaseFirestore.Timestamp;
}

export type LocationInsert = LocationFields;
export type LocationUpdate = Partial<LocationFields>;