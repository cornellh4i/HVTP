export interface UserRecord {
  id: string;
  email: string;
  name: string;
}

export interface UserInsert {
  id?: string;
  email: string;
  name: string;
}

export interface UserUpdate {
  email?: string;
  name?: string;
}
