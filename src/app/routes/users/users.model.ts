import { Accounts } from '../account/account.model';

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
