import { Accounts } from '../account/account.model';

export interface Branch {
  id: string;
  name: string;
  adress: string;
  accounts: Accounts[];
  createdAt: Date;
  updatedAt: Date;
}
