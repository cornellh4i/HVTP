export interface UserFields { 
    id?: string; 
    email: string;
    name: string;
}

export type UserInsert = UserFields;
export type UserUpdate = Partial<UserFields>;