export interface UserFields { 
    email: string;
    name: string;
}

export type UserInsert = Omit<UserFields, 'id'>;
export type UserUpdate = Partial<UserInsert>;
