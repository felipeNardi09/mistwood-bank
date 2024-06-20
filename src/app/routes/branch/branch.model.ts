import { Accounts } from '../accounts/accounts.model';

export interface Branch {
  id: string;
  name: string;
  adress: string;
  accounts: Accounts[];
  createdAt: Date;
  updatedAt: Date;
}
