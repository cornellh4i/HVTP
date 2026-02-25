import { Timestamp } from "firebase-admin/firestore";

export interface Location { 
    id ?: string, 
    name: string;
    section: string;
    isActive: boolean;
    createdAt: Timestamp;
}
