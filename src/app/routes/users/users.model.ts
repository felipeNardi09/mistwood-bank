import { Account } from '../account/account.model';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  accounts: Account[];
  createdAt: Date;
  updatedAt: Date;
}
