export interface UserFields { 
    id?: string; 
    email: string;
    name: string;
}

export type UserInsert = Omit<UserFields, 'id'>;
export type UserUpdate = Partial<UserInsert>;
