import { Accounts } from '../accounts/accounts.model';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  accounts: Accounts[];
  createdAt: Date;
  updatedAt: Date;
}
